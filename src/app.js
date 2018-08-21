import 'normalize.css/normalize.css';
import axios from 'axios';
import Meta from 'vue-meta';
import Vue from 'vue';

import './style/index.scss';
import App from './App.vue';
import { DwdUtilsMixin } from './utils';
import { createRouter } from './router';
import { createStore } from './store';

Vue.use(Meta);
Vue.mixin(DwdUtilsMixin);

export function createApp() {
  const $http = axios.create();
  const store = createStore($http);
  const router = createRouter(store);
  const app = new Vue({
    store,
    router,
    // Axios is exposed as $axios on the root element so it can be accessed by
    // all Vue instances via the $http computed property in DwdUtilsMixin.
    computed: { $axios: () => $http },
    render: (h) => h(App),
  });

  return { app, store, router };
}
