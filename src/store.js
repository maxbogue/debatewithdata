import axios from 'axios';
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import { walk } from './utils';
import { validateClaim, validateSource,
  validateTopic } from '../common/validate';

Vue.use(Vuex);

function getRootTopics(topics) {
  let rootTopics = clone(topics);
  forOwn(topics, (topic) => {
    if (topic.subTopicIds) {
      for (let subTopicId of topic.subTopicIds) {
        delete rootTopics[subTopicId];
      }
    }
  });
  return rootTopics;
}

// Whether the claim for claimId in s1 should be written to s2.
// This is the case if:
//   - claimId doesn't exist in s2, or
//   - s1 has a different revision than s2 (it's always newer), or
//   - s1 has more depth loaded than s2.
function shouldWriteClaim(claimId, s1, s2) {
  let c1 = s1.claims[claimId];
  let c2 = s2.claims[claimId];
  return !c2 || c1.revId !== c2.revId || c1.depth > c2.depth;
}

function hasFullClaim(state, id) {
  let claim = state.claims[id];
  return claim && claim.depth >= 3;
}

function copyClaim(claim) {
  let copy = cloneDeep(claim);
  walk(copy, (o) => delete o.tempId);
  return copy;
}

function addTrailToUrl(url, trail, state) {
  if (!trail) {
    return url;
  }
  trail = trail.filter((id) => !hasFullClaim(state, id) && !state.topics[id]);
  if (trail.length > 0) {
    url += '?trail=' + trail.join(',');
  }
  return url;
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
    rootTopics: {},
    user: null,
    singleColumn: windowIsSingleColumn(),
    itemBlocks: [],
    itemLocations: {},
    itemBlockSliding: false,
  },
  mutations: {
    setData: function (state, data) {
      if (data.topics) {
        forOwn(data.topics, (topic, id) => {
          Vue.set(state.topics, id, topic);
        });
        state.rootTopics = getRootTopics(state.topics);
      }
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          if (shouldWriteClaim(id, data, state)) {
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
      let url = addTrailToUrl('/api/topic/' + id, trail, state);
      return axios.get(url, { loader }).then((res) => {
        commit('setData', res.data);
      });
    },
    getTopics: function ({ commit }, { loader }) {
      return axios.get('/api/topic', { loader }).then((res) => {
        commit('setData', res.data);
        commit('setTopicsLoaded');
      });
    },
    updateTopic: function ({ commit }, { id, topic }) {
      validateTopic(topic);
      return axios.put('/api/topic/' + id, topic).then((res) => {
        commit('setData', res.data);
        return id;
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
      return axios.delete(`/api/topic/${id}?message=${message}`).then((res) => {
        commit('setData', res.data);
      });
    },
    getClaim: function ({ commit, state }, { id, trail, loader }) {
      let url = addTrailToUrl('/api/claim/' + id, trail, state);
      return axios.get(url, { loader }).then((res) => {
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
      return axios.delete(`/api/claim/${id}?message=${message}`).then((res) => {
        commit('setData', res.data);
      });
    },
    getSource: function ({ commit, state }, { id, trail, loader }) {
      let url = addTrailToUrl('/api/data/' + id, trail, state);
      return axios.get(url, { loader }).then((res) => {
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
      return axios.delete(`/api/data/${id}?message=${message}`)
        .then((res) => {
          commit('setData', res.data);
        });
    },
    getItem: function ({ commit }, { id, loader }) {
      return axios.get('/api/item/' + id, { loader }).then((res) => {
        commit('setData', res.data);
      });
    },
  },
  plugins: [singleColumnPlugin],
});
