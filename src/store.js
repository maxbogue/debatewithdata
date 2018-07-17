import axios from 'axios';
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

const storeOptions = {
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
    setUser: function (state, user) {
      state.user = user;
      state.topics = {};
      state.claims = {};
      state.source = {};
    },
    setUserFromToken: function (state, authToken) {
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
      await axios.post('/api/register', payload, { loader });
    },
    verifyEmail: async function ({ commit }, { token, loader }) {
      let res = await axios.post('/api/verify-email', { token }, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    login: async function ({ commit }, { username, password, loader }) {
      let payload = { username, password };
      let res = await axios.post('/api/login', payload, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    logout: async function ({ commit }) {
      commit('setUserFromToken', null);
    },
    forgotPassword: async function (_, { email, loader }) {
      await axios.post('/api/forgot-password', { email }, { loader });
    },
    resetPassword: async function ({ commit }, { token, password, loader }) {
      let payload = { token, password };
      let res = await axios.post('/api/reset-password', payload, { loader });
      commit('setUserFromToken', res.data.authToken);
    },
    getItem: function ({ commit, state }, { type, id, trail }) {
      let params = paramsFromTrail(trail, state);
      commit('setLoading', true);
      return axios.get(`/api/${type}/${id}`, { params }).then((res) => {
        commit('setLoading', false);
        commit('setData', res.data);
      }).catch((err) => {
        commit('setLoading', false);
        commit('setLoadingError', err);
        throw err;
      });
    },
    getItems: function ({ commit }, { type, sort, filters, page, loader }) {
      let params = {
        sort: sortFilterParam(sort),
        filter: filters.map(sortFilterParam).join(','),
        page,
      };
      return axios.get('/api/' + type, { params, loader }).then((res) => {
        commit('setData', res.data);
        return res.data;
      });
    },
    addItem: function ({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      return axios.post(`/api/${type}`, item).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    updateItem: function ({ commit }, { type, item }) {
      item = cleanItem(item);
      validateItem(type, item);
      return axios.put(`/api/${type}/${item.id}`, item).then((res) => {
        commit('setData', res.data);
        return item.id;
      }).catch((err) => {
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      });
    },
    removeItem: function ({ commit }, { type, id, message }) {
      let params = { message };
      return axios.delete(`/api/${type}/${id}`, { params }).then((res) => {
        commit('setData', res.data);
      });
    },
    search: function ({ commit }, { query, types, page, loader }) {
      let params = { query, types, page };
      return axios.get('/api/search', { params, loader }).then((res) => {
        commit('setData', res.data);
        return res.data;
      });
    },
    getNotifications: function ({ commit }, { loader }) {
      return axios.get('/api/notifications', { loader }).then((res) => {
        commit('setData', res.data);
        commit('setNotificationCount', 0);
        return res.data.results;
      });
    },
    updateNotificationCount: function ({ commit }) {
      return axios.get('/api/notifications/count').then((res) => {
        commit('setNotificationCount', res.data);
      });
    },
  },
  plugins: [singleColumnPlugin],
};

export function createStore() {
  return new Vuex.Store(storeOptions);
}
