import Vue from 'vue';
import VueRouter from 'vue-router';

import DwdApp from './DwdApp.vue';
import DwdClaim from './DwdClaim.vue';
import DwdHome from './DwdHome.vue';
import DwdLogin from './DwdLogin.vue';
import DwdLogout from './DwdLogout.vue';
import DwdRegister from './DwdRegister.vue';
import store from './store';

Vue.use(VueRouter);

new Vue({
  el: '#app',
  components: { DwdApp },
  store,
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: DwdHome },
      { path: '/register', component: DwdRegister },
      { path: '/login', component: DwdLogin },
      { path: '/logout', component: DwdLogout },
      { path: '/:claimId', component: DwdClaim },
    ],
  }),
  created: function () {
    this.$store.dispatch('getClaims');
  },
});
