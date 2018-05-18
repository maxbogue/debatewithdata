import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import search from '../common/search';
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
    topicsLoaded: false,
    claimsLoaded: false,
    sourcesLoaded: false,
    user: null,
    errorMessage: '',
    singleColumn: windowIsSingleColumn(),
    itemBlocks: [],
    itemLocations: {},
    itemBlockSliding: false,
  },
  getters: {
    rootTopics: function (state) {
      return filter(state.topics, (topic) => topic.isRoot);
    },
  },
  mutations: {
    setData: function (state, data) {
      if (data.topics) {
        forOwn(data.topics, (topic, id) => {
          if (shouldStoreTopic(id, data, state)) {
            search.updateTopic(topic);
            Vue.set(state.topics, id, topic);
          }
        });
      }
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          if (shouldStoreClaim(id, data, state)) {
            search.updateClaim(claim);
            Vue.set(state.claims, id, claim);
          }
        });
      }
      if (data.sources) {
        forOwn(data.sources, (source, id) => {
          search.updateSource(source);
          Vue.set(state.sources, id, source);
        });
      }
    },
    setTopicsLoaded: function (state) {
      state.topicsLoaded = true;
    },
    setClaimsLoaded: function (state) {
      state.claimsLoaded = true;
    },
    setSourcesLoaded: function (state) {
      state.sourcesLoaded = true;
    },
    setUser: function (state, user) {
      state.user = user;
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
  },
  actions: {
    getTopic: function ({ commit, state }, { id, trail, loader }) {
      let params = paramsFromTrail(trail, state);
      return axios.get(`/api/topic/${id}`, { params, loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    getTopics: function ({ commit }, { mode, loader }) {
      let params = { mode };
      return axios.get('/api/topic', { params, loader }).then((res) => {
        commit('setData', res.data);
        commit('setTopicsLoaded');
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
    getClaims: function ({ commit }, { loader }) {
      return axios.get('/api/claim', { loader }).then((res) => {
        commit('setData', res.data);
        commit('setClaimsLoaded');
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
      return axios.get(`/api/data/${id}`, { params, loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    getSources: function ({ commit }, { loader }) {
      return axios.get('/api/data', { loader }).then((res) => {
        commit('setData', { sources: res.data });
        commit('setSourcesLoaded');
      });
    },
    updateSource: function ({ commit }, { id, source }) {
      validateSource(source);
      return axios.put('/api/data/' + id, source).then((res) => {
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
      return axios.post('/api/data', source).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    removeSource: function ({ commit }, { id, message }) {
      let params = { message };
      return axios.delete(`/api/data/${id}`, { params })
        .then((res) => {
          commit('setData', res.data);
        });
    },
    getItem: function ({ commit }, { id, loader }) {
      return axios.get('/api/item/' + id, { loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    search: function ({ commit }, { query, types, limit, loader }) {
      let params = { query, types, limit };
      return axios.get('/api/search', { params, loader }).then((res) => {
        commit('setData', res.data);
        return res.data.results;
      });
    },
  },
  plugins: [singleColumnPlugin],
});
