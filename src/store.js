import Vue from 'vue';
import Vuex from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';

import { axiosErrorToString, walk } from './utils';
import { validateItem } from './common/validate';

Vue.use(Vuex);

const CONFLICT_ERROR_MESSAGE =
  'Item was modified since you began editing.' +
  ' Please review your changes against the new version and try again.';

// Whether i1 should be stored over i2.
function shouldStore(i1, i2) {
  return !i2 || i1.depth > i2.depth;
}

function cleanItem(item) {
  let copy = cloneDeep(item);
  walk(copy, o => delete o.tempId);
  return copy;
}

function filterTrail(trail, state) {
  if (!trail) {
    return [];
  }
  return trail.filter(id => !state.claims[id] && !state.topics[id]);
}

function windowIsSingleColumn() {
  return global.window ? window.innerWidth < 768 : false;
}

function singleColumnPlugin(store) {
  if (global.window) {
    window.addEventListener('resize', () => {
      store.commit('setSingleColumn', windowIsSingleColumn());
    });
  }
}

async function wrapLoading(commit, promise) {
  commit('setLoading', true);
  try {
    let ret = await promise;
    commit('setLoading', false);
    return ret;
  } catch (err) {
    commit('setLoading', false);
    commit('setLoadingError', err);
    throw err;
  }
}

async function wrapLoader(loader, promise) {
  if (!loader) {
    return await promise;
  }
  loader.setLoading(true);
  try {
    return await promise;
  } catch (err) {
    loader.setError(axiosErrorToString(err));
    throw err;
  } finally {
    loader.setLoading(false);
  }
}

const makeStoreOptions = (auth, api) => ({
  state: {
    topics: {},
    claims: {},
    sources: {},
    user: null,
    suppressRoutes: false,
    loading: false,
    loadingError: '',
    modalError: '',
    singleColumn: windowIsSingleColumn(),
    itemBlocks: [],
    itemLocations: {},
    itemBlockSliding: false,
    hasNotifications: false,
  },
  mutations: {
    setData(state, data) {
      if (data.topics) {
        forOwn(data.topics, (topic, id) => {
          if (shouldStore(topic, state.topics[id])) {
            Vue.set(state.topics, id, topic);
          }
        });
      }
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          if (shouldStore(claim, state.claims[id])) {
            Vue.set(state.claims, id, claim);
          }
        });
      }
      if (data.sources) {
        forOwn(data.sources, (source, id) => {
          Vue.set(state.sources, id, source);
        });
      }
    },
    setUserFromToken(state, authToken) {
      auth.setAuthToken(authToken);
      // User will be null here if the auth token has expired.
      state.user = auth.getUser();
      state.topics = {};
      state.claims = {};
      state.source = {};
    },
    setSuppressRoutes(state, suppressRoutes) {
      state.suppressRoutes = suppressRoutes;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setLoadingError(state, err) {
      state.loadingError = axiosErrorToString(err);
    },
    setModalError(state, modalError) {
      state.modalError = modalError;
    },
    setSingleColumn(state, isSingleColumn) {
      state.singleColumn = isSingleColumn;
    },
    registerItemBlock(state, vm) {
      state.itemBlocks.push(vm);
    },
    unregisterItemBlock(state, vm) {
      let i = state.itemBlocks.indexOf(vm);
      if (i < 0) {
        console.warn('Missing item block.');
      } else {
        state.itemBlocks.splice(i, 1);
      }
    },
    storeItemBlockLocations(state) {
      state.itemLocations = {};
      state.itemBlockSliding = false;
      forEach(state.itemBlocks, vm => {
        state.itemLocations[vm.id] = vm.$el.getBoundingClientRect();
      });
    },
    itemBlockSliding(state) {
      state.itemBlockSliding = true;
    },
    setHasNotifications(state, hasNotifications) {
      state.hasNotifications = hasNotifications;
    },
  },
  actions: {
    async register(_, { username, password, email, loader }) {
      const promise = api.register(username, password, email);
      await wrapLoader(loader, promise);
    },
    async verifyEmail({ commit }, { token, loader }) {
      const promise = await api.verifyEmail(token);
      const authToken = await wrapLoader(loader, promise);
      commit('setUserFromToken', authToken);
    },
    async login({ commit }, { username, password, loader }) {
      const promise = api.login(username, password);
      const authToken = await wrapLoader(loader, promise);
      commit('setUserFromToken', authToken);
    },
    async logout({ commit }) {
      commit('setUserFromToken', null);
    },
    async forgotPassword(_, { email, loader }) {
      const promise = api.forgotPassword(email);
      await wrapLoader(loader, promise);
    },
    async resetPassword({ commit }, { token, password, loader }) {
      const promise = api.resetPassword(token, password);
      const authToken = await wrapLoader(loader, promise);
      commit('setUserFromToken', authToken);
    },
    async getUser(_, { username, loader }) {
      const promise = api.getUser(username);
      return await wrapLoader(loader, promise);
    },
    async getItem({ commit, state }, { type, id, trail }) {
      const filteredTrail = filterTrail(trail, state);
      const promise = api.getItem(type, id, filteredTrail);
      const data = await wrapLoading(commit, promise);
      commit('setData', data);
    },
    async getItems({ commit }, { type, sort, filters, page, loader }) {
      const promise = api.getItems(type, filters, sort, page);
      const data = await wrapLoader(loader, promise);
      commit('setData', data);
      return data;
    },
    async search({ commit }, { query, types, page, loader }) {
      const promise = api.search(query, types, page);
      const data = await wrapLoader(loader, promise);
      commit('setData', data);
      return data;
    },
    async addItem({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      const data = await api.createItem(type, item);
      commit('setData', data);
      return data.id;
    },
    async updateItem({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      try {
        const data = await api.updateItem(type, item.id, item);
        commit('setData', data);
        return item.id;
      } catch (err) {
        // TODO: Translate HTTP errors at the ApiClient level.
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      }
    },
    async removeItem({ commit }, { type, id, message }) {
      const data = await api.deleteItem(type, id, message);
      commit('setData', data);
    },
    async getItemRevs({ commit }, { type, id }) {
      const data = await wrapLoading(commit, api.getItemRevs(type, id));
      commit('setData', data);
      return data;
    },
    async toggleStar(_, { type, id }) {
      return await api.toggleStar(type, id);
    },
    async toggleWatch(_, { type, id }) {
      return await api.toggleWatch(type, id);
    },
    async getComments(_, { type, id }) {
      return await api.getComments(type, id);
    },
    async createComment(_, { type, id, text }) {
      return await api.createComment(type, id, text);
    },
    async deleteComment(_, { type, id, commentId }) {
      return await api.deleteComment(type, id, commentId);
    },
    async getActivity({ commit }) {
      return await wrapLoading(commit, api.getActivity());
    },
    async getNotifications({ commit }) {
      const promise = api.getNotifications();
      const data = await wrapLoading(commit, promise);
      commit('setData', data);
      return data.results;
    },
    async updateHasNotifications({ commit }) {
      const data = await api.hasNotifications();
      commit('setHasNotifications', data.hasNotifications);
    },
    async readNotifications({ commit }, { until }) {
      const data = await api.readNotifications(until);
      commit('setHasNotifications', data.hasNotifications);
    },
  },
  plugins: [singleColumnPlugin],
});

export function createStore(api, auth) {
  const store = new Vuex.Store(makeStoreOptions(auth, api));
  store.commit('setUserFromToken', auth.getAuthToken());
  return store;
}
