import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function axiosErrorToString(error) {
  if (!error.response) {
    return 'Server not responding';
  } else if (error.response.status >= 500) {
    return 'Server error';
  }
  return error.response.data.message;
}

export default new Vuex.Store({
  state: {
    claims: {},
  },
  mutations: {
    updateClaim: function (state, { id, claim }) {
      state.claims[id] = claim;
    },
    updateClaims: function (state, claims) {
      state.claims = claims;
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

