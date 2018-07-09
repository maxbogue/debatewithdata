import 'normalize.css/normalize.css';
import axios from 'axios';
import Vue from 'vue';

import './style/index.scss';
import AppLayout from './AppLayout.vue';
import auth from './auth';
import router from './router';
import store from './store';
import { DwdUtilsMixin, axiosErrorToString } from './utils';

Vue.mixin(DwdUtilsMixin);

store.commit('setUser', auth.getUser());

function axiosError(err) {
  if (err.config && err.config.loader) {
    err.config.loader.setError(axiosErrorToString(err));
  }
  return Promise.reject(err);
}

new Vue({
  el: '#app',
  components: { AppLayout },
  store,
  router,
  created: function () {
    auth.updateHeader();
    axios.interceptors.request.use((config) => {
      if (config.loader) {
        config.loader.setLoading(true);
      }
      return config;
    }, axiosError);
    axios.interceptors.response.use((res) => {
      if (res.config.loader) {
        res.config.loader.setLoading(false);
      }
      return res;
    }, axiosError);
  },
});
