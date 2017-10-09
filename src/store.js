import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import forOwn from 'lodash/forOwn';
import Vue from 'vue';
import Vuex from 'vuex';

import { walk } from './utils';

Vue.use(Vuex);

// Whether the claim for claimId in s1 should be written to s2.
// This is the case if:
//   - claimId doesn't exist in s2, or
//   - s1 has a different revision than s2 (it's always newer), or
//   - s1 has more depth loaded than s2.
function shouldWriteClaim(claimId, s1, s2) {
  let c1 = s1.claims[claimId];
  let c2 = s2.claims[claimId];
  return !c2 || c1.rev !== c2.rev || c1.depth > c2.depth;
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
    claims: {},
    sources: {},
    claimsLoaded: false,
    sourcesLoaded: false,
    user: null,
    singleColumn: windowIsSingleColumn(),
  },
  mutations: {
    setData: function (state, data) {
      if (data.claims) {
        forOwn(data.claims, (claim, id) => {
          if (shouldWriteClaim(id, data, state)) {
            claim.id = id;
            Vue.set(state.claims, id, claim);
          }
        });
      }
      if (data.sources) {
        forOwn(data.sources, (source, id) => {
          source.id = id;
          Vue.set(state.sources, id, source);
        });
      }
    },
    setClaim: function (state, { id, claim }) {
      claim.id = id;
      Vue.set(state.claims, id, claim);
    },
    removeClaim: function (state, id) {
      Vue.delete(state.claims, id);
    },
    setSource: function (state, { id, source }) {
      source.id = id;
      Vue.set(state.sources, id, source);
    },
    removeSource: function (state, id) {
      Vue.delete(state.sources, id);
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
  },
  actions: {
    getClaim: function ({ commit, state }, { id, trail, loader }) {
      let url = '/api/claim/' + id;
      if (trail) {
        trail = trail.filter((itemId) => !hasFullClaim(state, itemId));
        if (trail.length > 0) {
          url += '?trail=' + trail.join(',');
        }
      }
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
      return axios.put('/api/claim/' + id, copyClaim(claim)).then((res) => {
        commit('setClaim', {
          id,
          claim: res.data.claim,
        });
        return id;
      });
    },
    addClaim: function ({ commit }, { claim }) {
      return axios.post('/api/claim', copyClaim(claim)).then((res) => {
        commit('setData', res.data);
        return res.data.id;
      });
    },
    removeClaim: function ({ commit }, { id }) {
      return axios.delete('/api/claim/' + id).then(() => {
        commit('removeClaim', id);
      });
    },
    getSource: function ({ commit }, { id, loader }) {
      return axios.get('/api/source/' + id, { loader }).then((res) => {
        commit('setSource', { id, source: res.data });
      });
    },
    getSources: function ({ commit }, { loader }) {
      return axios.get('/api/source', { loader }).then((res) => {
        commit('setData', { sources: res.data });
        commit('setSourcesLoaded');
      });
    },
    updateSource: function ({ commit }, { id, source }) {
      return axios.put('/api/source/' + id, source).then(() => {
        commit('setSource', { id, source });
        return id;
      });
    },
    addSource: function ({ commit }, { source }) {
      return axios.post('/api/source', source).then((res) => {
        commit('setSource', { id: res.data.id, source });
        return res.data.id;
      });
    },
    removeSource: function ({ commit }, { id }) {
      return axios.delete('/api/source/' + id).then(() => {
        commit('removeSource', id);
      });
    },
  },
  plugins: [singleColumnPlugin],
});
