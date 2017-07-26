import axios from 'axios';
import { cloneDeep, forOwn } from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString, genId, walk } from './utils';

Vue.use(Vuex);

function addTempIds(points) {
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points[i].length; j++) {
      let p = points[i][j];
      if (!p.id && !p.tempId) {
        p.tempId = genId();
      }
      if (p.points) {
        addTempIds(p.points);
      }
    }
  }
}

function sanitizeClaim(claim) {
  if (!claim.points) {
    claim.points = [[], []];
  }
  addTempIds(claim.points);
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
    loaded: false,
    claims: {},
    sources: {},
    stars: {
      'claim': {},
      'source': {},
      'point': {},
    },
    user: null,
    singleColumn: windowIsSingleColumn(),
  },
  mutations: {
    loaded: function (state) {
      state.loaded = true;
    },
    setClaim: function (state, { id, claim }) {
      sanitizeClaim(claim);
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
    loadClaimStars: function ({ commit }, { id }) {
      axios.get('/api/claim/' + id + '/star').then((response) => {
        commit('setStar', {
          type: 'claim',
          id,
          star: response.data.star,
        });
        forOwn(response.data.points, (v, k) => {
          commit('setStar', {
            type: 'point',
            id: k,
            star: v,
          });
        });
      });
    },
    toggleStar: function ({ commit }, { type, id }) {
      axios.post('/api/' + type + '/' + id + '/star').then((response) => {
        commit('setStar', {
          type,
          id,
          star: response.data.star,
        });
      });
    },
  },
  plugins: [singleColumnPlugin],
});

