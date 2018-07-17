import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import { axiosErrorToString, walk } from './utils';
import { validateItem } from '../common/validate';

Vue.use(Vuex);

const CONFLICT_ERROR_MESSAGE = 'Item was modified since you began editing.'
  + ' Please review your changes against the new version and try again.';

// Whether the claim for claimId in s1 should be written to s2.
// This is the case if:
//   - claimId doesn't exist in s2, or
//   - s1 has a different revision than s2 (it's always newer), or
//   - s1 has more depth loaded than s2.
function shouldStoreClaim(claimId, s1, s2) {
  let c1 = s1.claims[claimId];
  let c2 = s2.claims[claimId];
  return !c2 || c1.revId !== c2.revId || c1.depth > c2.depth;
}

function shouldStoreTopic(topicId, s1, s2) {
  let t1 = s1.topics[topicId];
  let t2 = s2.topics[topicId];
  return !t2 || t1.revId !== t2.revId || t1.depth > t2.depth;
}

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
    notificationCount: 0,
  },
  mutations: {
    setData: function (state, data) {
      if (data.topics) {
        forOwn(data.topics, (topic, id) => {
          if (shouldStoreTopic(id, data, state)) {
            Vue.set(state.topics, id, topic);
          }
        });
      }
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          if (shouldStoreClaim(id, data, state)) {
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
    setUserFromToken: function (state, authToken) {
      if (authToken) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + authToken;
      } else {
        delete $http.defaults.headers.common.Authorization;
      }
      auth.setAuthToken(authToken);
      state.user = auth.getUser();
      state.topics = {};
      state.claims = {};
      state.source = {};
    },
    setSuppressRoutes: function (state, suppressRoutes) {
      state.suppressRoutes = suppressRoutes;
    },
    setLoading: function (state, loading) {
      state.loading = loading;
    },
    setLoadingError: function (state, err) {
      state.loadingError = axiosErrorToString(err);
    },
    setModalError: function (state, modalError) {
      state.modalError = modalError;
    },
    setSingleColumn: function (state, isSingleColumn) {
      state.singleColumn = isSingleColumn;
    },
    registerItemBlock: function (state, vm) {
      state.itemBlocks.push(vm);
    },
    unregisterItemBlock: function (state, vm) {
      let i = state.itemBlocks.indexOf(vm);
      if (i < 0) {
        console.warn('Missing item block.');
      } else {
        state.itemBlocks.splice(i, 1);
      }
    },
    storeItemBlockLocations: function (state) {
      state.itemLocations = {};
      state.itemBlockSliding = false;
      forEach(state.itemBlocks, (vm) => {
        state.itemLocations[vm.id] = vm.$el.getBoundingClientRect();
      });
    },
    itemBlockSliding: function (state) {
      state.itemBlockSliding = true;
    },
    setNotificationCount: function (state, notificationCount) {
      state.notificationCount = notificationCount;
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
      commit('setLoading', true);
      try {
        let res = await $http.get(`/api/${type}/${id}`, { params });
        commit('setLoading', false);
        commit('setData', res.data);
      } catch (err) {
        commit('setLoading', false);
        commit('setLoadingError', err);
        throw err;
      }
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
    getNotifications: async function ({ commit }, { loader }) {
      let res = await $http.get('/api/notifications', { loader });
      commit('setData', res.data);
      commit('setNotificationCount', 0);
      return res.data.results;
    },
    updateNotificationCount: async function ({ commit }) {
      let res = await $http.get('/api/notifications/count');
      commit('setNotificationCount', res.data);
    },
  },
  plugins: [singleColumnPlugin],
});

export function createStore($http) {
  let store = new Vuex.Store(makeStoreOptions($http));
  store.commit('setUserFromToken', auth.getAuthToken());
  return store;
}
