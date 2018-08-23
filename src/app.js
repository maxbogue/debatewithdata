//import 'normalize.css/normalize.css';
import Meta from 'vue-meta';
import Vue from 'vue';

import './style/index.scss';
import App from './App.vue';
import { DwdUtilsMixin } from './utils';
import { createRouter } from './router';
import { createStore } from './store';

Vue.use(Meta);
Vue.mixin(DwdUtilsMixin);

export function createApp(api, auth) {
  const store = createStore(api, auth);
  const router = createRouter(auth, store);
  const app = new Vue({
    store,
    router,
    render: (h) => h(App),
  });

  return { app, store, router };
}
