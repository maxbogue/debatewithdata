import axios from 'axios';
import { cloneDeep, forOwn } from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString, walk } from './utils';

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
    user: null,
    singleColumn: windowIsSingleColumn(),
  },
  mutations: {
    setData: function (state, data) {
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
    setClaim: function (state, { id, claim }) {
      Vue.set(state.claims, id, claim);
    },
    removeClaim: function (state, id) {
      Vue.delete(state.claims, id);
    },
    setSource: function (state, { id, source }) {
      Vue.set(state.sources, id, source);
    },
    removeSource: function (state, id) {
      Vue.delete(state.sources, id);
    },
    setUser: function (state, user) {
      state.user = user;
    },
    setStar: function (state, { type, id, star }) {
      Vue.set(state.stars[type], id, star);
    },
    setSingleColumn: function (state, isSingleColumn) {
      state.singleColumn = isSingleColumn;
    },
  },
  actions: {
    getClaim: function ({ commit }, { id }) {
      return axios.get('/api/claim/' + id).then(function (response) {
        commit('setData', response.data);
      });
    },
    getClaims: function ({ commit }) {
      return axios.get('/api/claim').then(function (response) {
        commit('setData', response.data);
      });
    },
    updateClaim: function ({ commit }, { id, claim }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/claim/' + id, copyClaim(claim)).then((response) => {
          commit('setClaim', {
            id,
            claim: response.data.claim,
          });
          resolve(id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    addClaim: function ({ commit }, { claim }) {
      return new Promise((resolve, reject) => {
        axios.post('/api/claim', copyClaim(claim)).then((response) => {
          commit('setClaim', {
            id: response.data.id,
            claim: response.data.claim,
          });
          resolve(response.data.id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    removeClaim: function ({ commit }, { id }) {
      return new Promise((resolve, reject) => {
        axios.delete('/api/claim/' + id).then(() => {
          commit('removeClaim', id);
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    getSource: function ({ commit }, { id }) {
      return axios.get('/api/source/' + id).then(function (response) {
        commit('setSource', { id, source: response.data });
      });
    },
    getSources: function ({ commit }) {
      return axios.get('/api/source').then(function (response) {
        commit('setData', { sources: response.data });
      });
    },
    updateSource: function ({ commit }, { id, source }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/source/' + id, source).then(() => {
          commit('setSource', { id, source });
          resolve(id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    addSource: function ({ commit }, { source }) {
      return new Promise((resolve, reject) => {
        axios.post('/api/source', source).then((response) => {
          commit('setSource', { id: response.data.id, source });
          resolve(response.data.id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    removeSource: function ({ commit }, { id }) {
      return new Promise((resolve, reject) => {
        axios.delete('/api/source/' + id).then(() => {
          commit('removeSource', id);
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
  },
  plugins: [singleColumnPlugin],
});
