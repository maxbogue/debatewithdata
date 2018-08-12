import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
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
  return window.innerWidth < 768;
}

function singleColumnPlugin(store) {
  window.addEventListener('resize', () => {
    store.commit('setSingleColumn', windowIsSingleColumn());
  });
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

const makeStoreOptions = ($http) => ({
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
      let user = auth.getUser();
      if (user) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + authToken;
      } else {
        delete $http.defaults.headers.common.Authorization;
      }
      state.user = user;
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
    register: async function (_, { username, password, email, loader }) {
      let payload = { username, password, email };
      await $http.post('/api/register', payload, { loader });
    },
    verifyEmail: async function ({ commit }, { token, loader }) {
      let res = await $http.post('/api/verify-email', { token }, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    login: async function ({ commit }, { username, password, loader }) {
      let payload = { username, password };
      let res = await $http.post('/api/login', payload, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    logout: async function ({ commit }) {
      commit('setUserFromToken', null);
    },
    forgotPassword: async function (_, { email, loader }) {
      await $http.post('/api/forgot-password', { email }, { loader });
    },
    resetPassword: async function ({ commit }, { token, password, loader }) {
      let payload = { token, password };
      let res = await $http.post('/api/reset-password', payload, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    getItem: async function ({ commit, state }, { type, id, trail }) {
      let params = paramsFromTrail(trail, state);
      let promise = $http.get(`/api/${type}/${id}`, { params });
      let res = await wrapLoading(commit, promise);
      commit('setData', res.data);
    },
    getItems: async function ({ commit },
                              { type, sort, filters, page, loader }) {
      let params = {
        sort: sortFilterParam(sort),
        filter: filters.map(sortFilterParam).join(','),
        page,
      };
      let res = await $http.get('/api/' + type, { params, loader });
      commit('setData', res.data);
      return res.data;
    },
    addItem: async function ({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      let res = await $http.post(`/api/${type}`, item);
      commit('setData', res.data);
      return res.data.id;
    },
    updateItem: async function ({ commit }, { type, item }) {
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
    removeItem: async function ({ commit }, { type, id, message }) {
      let params = { message };
      let res = await $http.delete(`/api/${type}/${id}`, { params });
      commit('setData', res.data);
    },
    search: async function ({ commit }, { query, types, page, loader }) {
      let params = { query, types, page };
      let res = await $http.get('/api/search', { params, loader });
      commit('setData', res.data);
      return res.data;
    },
    getNotifications: async function ({ commit }) {
      let promise = $http.get('/api/notifications');
      let res = await wrapLoading(commit, promise);
      commit('setData', res.data);
      return res.data.results;
    },
    updateHasNotifications: async function ({ commit }) {
      let res = await $http.get('/api/notifications/has');
      commit('setHasNotifications', res.data.hasNotifications);
    },
    readNotifications: async function ({ commit }, { until }) {
      let res = await $http.post('/api/notifications/read', { until });
      commit('setHasNotifications', res.data.hasNotifications);
    },
  },
  plugins: [singleColumnPlugin],
});

export function createStore($http) {
  let store = new Vuex.Store(makeStoreOptions($http));
  store.commit('setUserFromToken', auth.getAuthToken());
  return store;
}
