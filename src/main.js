import Vue from 'vue';
import VueRouter from 'vue-router';

import DwdAccount from './DwdAccount.vue';
import DwdApp from './DwdApp.vue';
import DwdClaim from './DwdClaim.vue';
import DwdClaims from './DwdClaims.vue';
import DwdHome from './DwdHome.vue';
import DwdLogin from './DwdLogin.vue';
import DwdLogout from './DwdLogout.vue';
import DwdRegister from './DwdRegister.vue';
import auth from './auth';
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
      { path: '/account', component: DwdAccount },
      { path: '/login', component: DwdLogin },
      { path: '/logout', component: DwdLogout },
      { path: '/register', component: DwdRegister },
      { path: '/claims', component: DwdClaims },
      { path: '/claim/:claimId', component: DwdClaim },
    ],
  }),
  created: function () {
    this.$store.commit('setUser', auth.getUser());
    this.$store.dispatch('getClaims');
  },
});
