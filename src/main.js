import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';

import DwdApp from './DwdApp.vue';
import DwdDebate from './DwdDebate.vue';
import DwdLogin from './DwdLogin.vue';
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
      { path: '/login', component: DwdLogin },
      { path: '/register', component: DwdRegister },
    ],
  }),
});
