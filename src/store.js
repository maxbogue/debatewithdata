import axios from 'axios';
import { forOwn } from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString } from './utils';

Vue.use(Vuex);

function sanitizeClaim(claim) {
  if (!claim.points) {
    claim.points = [[], []];
  }
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
    loaded: false,
    claims: {},
    sources: {},
    user: null,
    singleColumn: windowIsSingleColumn(),
  },
  mutations: {
    loaded: function (state) {
      state.loaded = true;
    },
    setClaim: function (state, { id, claim }) {
      Vue.set(state.claims, id, claim);
    },
    setClaims: function (state, claims) {
      forOwn(claims, sanitizeClaim);
      state.claims = claims;
    },
    removeClaim: function (state, id) {
      Vue.delete(state.claims, id);
    },
    setSource: function (state, { id, source }) {
      Vue.set(state.sources, id, source);
    },
    setSources: function (state, sources) {
      state.sources = sources;
    },
    setUser: function (state, user) {
      state.user = user;
    },
    setSingleColumn: function (state, isSingleColumn) {
      state.singleColumn = isSingleColumn;
    },
  },
  actions: {
    load: function ({ commit }) {
      let claimsLoaded = axios.get('/api/claim').then(function (response) {
        commit('setClaims', response.data);
      });
      let sourcesLoaded = axios.get('/api/source').then(function (response) {
        commit('setSources', response.data);
      });
      Promise.all([claimsLoaded, sourcesLoaded]).then(function () {
        commit('loaded');
      });
    },
    updateClaim: function ({ commit }, { id, claim }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/claim/' + id, claim).then(() => {
          commit('setClaim', { id, claim });
          resolve(id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
    addClaim: function ({ commit }, { claim }) {
      return new Promise((resolve, reject) => {
        axios.post('/api/claim', claim).then((response) => {
          commit('setClaim', { id: response.data.id, claim });
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
          resolve(response.data.id);
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
  },
  plugins: [singleColumnPlugin],
});

