import 'normalize.css/normalize.css';
import axios from 'axios';
import Vue from 'vue';

import './style/index.scss';
import App from './App.vue';
import auth from './auth';
import { DwdUtilsMixin, axiosErrorToString } from './utils';
import { createRouter } from './router';
import { createStore } from './store';

Vue.mixin(DwdUtilsMixin);

function axiosError(err) {
  if (err.config && err.config.loader) {
    err.config.loader.setError(axiosErrorToString(err));
  }
  return Promise.reject(err);
}

export function createApp() {
  const store = createStore();
  store.commit('setUser', auth.getUser());

  const router = createRouter(store);

  const app = new Vue({
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
    render: (h) => h(App),
  });
  return { app };
}
