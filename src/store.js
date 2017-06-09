import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString } from './utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    claims: {},
    sources: {},
    user: null,
  },
  mutations: {
    setClaim: function (state, { id, claim }) {
      state.claims[id] = claim;
    },
    setClaims: function (state, claims) {
      state.claims = claims;
    },
    setSource: function (state, { id, source }) {
      state.source[id] = source;
    },
    setSources: function (state, sources) {
      state.sources = sources;
    },
    setUser: function (state, user) {
      state.user = user;
    },
  },
  actions: {
    loadClaims: function ({ commit }) {
      axios.get('/api/claim').then(function (response) {
        commit('setClaims', response.data);
      });
    },
    updateClaim: function ({ commit }, { id, claim }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/claim/' + id, claim).then(() => {
          commit('setClaim', { id, claim });
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    addClaim: function ({ commit }, { claim }) {
      return new Promise((resolve, reject) => {
        axios.post('/api/claim', claim).then((response) => {
          commit('setClaim', { id: response.data.id, claim });
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    loadSources: function ({ commit }) {
      axios.get('/api/source').then(function (response) {
        commit('setSources', response.data);
      });
    },
    updateSource: function ({ commit }, { id, source }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/source/' + id, source).then(() => {
          commit('setSource', { id, source });
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    addSource: function ({ commit }, { source }) {
      return new Promise((resolve, reject) => {
        axios.post('/api/source', source).then((response) => {
          commit('setSource', { id: response.data.id, source });
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
  },
});

