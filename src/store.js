import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString, walk } from './utils';
import { validateItem } from './common/validate';

Vue.use(Vuex);

const CONFLICT_ERROR_MESSAGE = 'Item was modified since you began editing.'
  + ' Please review your changes against the new version and try again.';

function cleanItem(item) {
  let copy = cloneDeep(item);
  walk(copy, (o) => delete o.tempId);
  return copy;
}

function paramsFromTrail(trail, state) {
  if (!trail) {
    return {};
  }
  trail = trail.filter((id) => !state.claims[id] && !state.topics[id]);
  if (trail.length > 0) {
    return { trail: trail.join(',') };
  }
  return {};
}

function sortFilterParam([s, b]) {
  return (b ? '+' : '-') + s;
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

const makeStoreOptions = (auth, $http) => ({
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
          Vue.set(state.topics, id, topic);
        });
      }
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          Vue.set(state.claims, id, claim);
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
      forEach(state.itemBlocks, (vm) => {
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
      let payload = { username, password, email };
      let promise = $http.post('/api/register', payload);
      await wrapLoader(loader, promise);
    },
    async verifyEmail({ commit }, { token, loader }) {
      let promise = $http.post('/api/verify-email', { token });
      await wrapLoader(loader, promise);
      commit('setUserFromToken', auth.getAuthToken());
    },
    async login({ commit }, { username, password, loader }) {
      let payload = { username, password };
      let promise = $http.post('/api/login', payload);
      await wrapLoader(loader, promise);
      commit('setUserFromToken', auth.getAuthToken());
    },
    async logout({ commit }) {
      commit('setUserFromToken', null);
    },
    async forgotPassword(_, { email, loader }) {
      let promise = $http.post('/api/forgot-password', { email });
      await wrapLoader(loader, promise);
    },
    async resetPassword({ commit }, { token, password, loader }) {
      let payload = { token, password };
      let promise = $http.post('/api/reset-password', payload);
      await wrapLoader(loader, promise);
      commit('setUserFromToken', auth.getAuthToken());
    },
    async getItem({ commit, state }, { type, id, trail }) {
      let params = paramsFromTrail(trail, state);
      let promise = $http.get(`/api/${type}/${id}`, { params });
      let res = await wrapLoading(commit, promise);
      commit('setData', res.data);
    },
    async getItems({ commit }, { type, sort, filters, page, loader }) {
      let params = {
        sort: sortFilterParam(sort),
        filter: filters.map(sortFilterParam).join(','),
        page,
      };
      let promise = $http.get('/api/' + type, { params });
      let res = await wrapLoader(loader, promise);
      commit('setData', res.data);
      return res.data;
    },
    async addItem({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      let res = await $http.post(`/api/${type}`, item);
      commit('setData', res.data);
      return res.data.id;
    },
    async updateItem({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      try {
        let res = await $http.put(`/api/${type}/${item.id}`, item);
        commit('setData', res.data);
        return item.id;
      } catch (err) {
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      }
    },
    async removeItem({ commit }, { type, id, message }) {
      let params = { message };
      let res = await $http.delete(`/api/${type}/${id}`, { params });
      commit('setData', res.data);
    },
    async search({ commit }, { query, types, page, loader }) {
      let params = { query, types, page };
      let promise = $http.get('/api/search', { params });
      let res = await wrapLoader(loader, promise);
      commit('setData', res.data);
      return res.data;
    },
    async getNotifications({ commit }) {
      let promise = $http.get('/api/notifications');
      let res = await wrapLoading(commit, promise);
      commit('setData', res.data);
      return res.data.results;
    },
    async updateHasNotifications({ commit }) {
      let res = await $http.get('/api/notifications/has');
      commit('setHasNotifications', res.data.hasNotifications);
    },
    async readNotifications({ commit }, { until }) {
      let res = await $http.post('/api/notifications/read', { until });
      commit('setHasNotifications', res.data.hasNotifications);
    },
  },
  plugins: [singleColumnPlugin],
});

export function createStore(auth, http) {
  let store = new Vuex.Store(makeStoreOptions(auth, http));
  store.commit('setUserFromToken', auth.getAuthToken());
  return store;
}
