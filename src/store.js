import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import { walk } from './utils';
import { validateClaim, validateSource,
  validateTopic } from '../common/validate';

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

function copyClaim(claim) {
  let copy = cloneDeep(claim);
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

export default new Vuex.Store({
  state: {
    topics: {},
    claims: {},
    sources: {},
    user: null,
    errorMessage: '',
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
    setErrorMessage: function (state, errorMessage) {
      state.errorMessage = errorMessage;
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
    getItem: function ({ commit }, { id, loader }) {
      return axios.get('/api/item/' + id, { loader }).then((res) => {
        commit('setData', res.data);
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
    getTopic: function ({ commit, state }, { id, trail, loader }) {
      let params = paramsFromTrail(trail, state);
      return axios.get(`/api/topic/${id}`, { params, loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    updateTopic: function ({ commit }, { id, topic }) {
      validateTopic(topic);
      return axios.put('/api/topic/' + id, topic).then((res) => {
        commit('setData', res.data);
        return id;
      }).catch((err) => {
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      });
    },
    addTopic: function ({ commit }, { topic }) {
      validateTopic(topic);
      return axios.post('/api/topic', topic).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    removeTopic: function ({ commit }, { id, message }) {
      let params = { message };
      return axios.delete(`/api/topic/${id}`, { params }).then((res) => {
        commit('setData', res.data);
      });
    },
    getClaim: function ({ commit, state }, { id, trail, loader }) {
      let params = paramsFromTrail(trail, state);
      return axios.get(`/api/claim/${id}`, { params, loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    updateClaim: function ({ commit }, { id, claim }) {
      validateClaim(claim);
      return axios.put('/api/claim/' + id, copyClaim(claim)).then((res) => {
        commit('setData', res.data);
        return id;
      }).catch((err) => {
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      });
    },
    addClaim: function ({ commit }, { claim }) {
      validateClaim(claim);
      return axios.post('/api/claim', copyClaim(claim)).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    removeClaim: function ({ commit }, { id, message }) {
      let params = { message };
      return axios.delete(`/api/claim/${id}`, { params }).then((res) => {
        commit('setData', res.data);
      });
    },
    getSource: function ({ commit, state }, { id, trail, loader }) {
      let params = paramsFromTrail(trail, state);
      return axios.get(`/api/source/${id}`, { params, loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    updateSource: function ({ commit }, { id, source }) {
      validateSource(source);
      return axios.put('/api/source/' + id, source).then((res) => {
        commit('setData', res.data);
        return id;
      }).catch((err) => {
        if (err.response.status === 409) {
          commit('setData', err.response.data.data);
          commit('setErrorMessage', CONFLICT_ERROR_MESSAGE);
        }
        throw err;
      });
    },
    addSource: function ({ commit }, { source }) {
      validateSource(source);
      return axios.post('/api/source', source).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    removeSource: function ({ commit }, { id, message }) {
      let params = { message };
      return axios.delete(`/api/source/${id}`, { params })
        .then((res) => {
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
});
