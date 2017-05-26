import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';

import DwdApp from './DwdApp.vue';
import DwdDebate from './DwdDebate.vue';
import DwdLogin from './DwdLogin.vue';
import DwdLogout from './DwdLogout.vue';
import DwdRegister from './DwdRegister.vue';

Vue.use(VueResource);
Vue.use(VueRouter);

new Vue({
  el: '#app',
  components: { DwdApp },
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: DwdDebate },
      { path: '/register', component: DwdRegister },
      { path: '/login', component: DwdLogin },
      { path: '/logout', component: DwdLogout },
      { path: '/:claimId?', component: DwdDebate },
    ],
  }),
});
