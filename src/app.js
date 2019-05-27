import './style/index.scss';

import Vue from 'vue';
import Meta from 'vue-meta';

import App from './App.vue';
import { createRouter } from './router';
import { createStore } from './store';
import { DwdUtilsMixin } from './utils';

Vue.use(Meta);
Vue.mixin(DwdUtilsMixin);

export function createApp(api, auth) {
  const store = createStore(api, auth);
  const router = createRouter(auth, store);
  const app = new Vue({
    store,
    router,
    render: h => h(App),
  });

  return { app, store, router };
}
