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
    // Axios is exposed as $axios on the root element so it can be accessed by
    // all Vue instances via the $http computed property in DwdUtilsMixin.
    // TODO: All API calls should go through the api object.
    computed: { $axios: () => api.http },
    render: (h) => h(App),
  });

  return { app, store, router };
}
