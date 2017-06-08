import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';

import { axiosErrorToString } from './utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    claims: {},
    user: null,
  },
  mutations: {
    updateClaim: function (state, { id, claim }) {
      state.claims[id] = claim;
    },
    updateClaims: function (state, claims) {
      state.claims = claims;
    },
    setUser: function (state, user) {
      state.user = user;
    },
  },
  actions: {
    getClaims: function ({ commit }) {
      axios.get('/api/claim').then(function (response) {
        commit('updateClaims', response.data);
      });
    },
    updateClaim: function ({ commit }, { id, claim }) {
      return new Promise((resolve, reject) => {
        axios.put('/api/claim/' + id, claim).then(() => {
          commit('updateClaim', { id, claim });
          resolve();
        }).catch((error) => {
          reject(axiosErrorToString(error));
        });
      });
    },
  },
});

