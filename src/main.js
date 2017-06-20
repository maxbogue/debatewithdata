import { find } from 'lodash';
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
import DwdSource from './DwdSource.vue';
import DwdSources from './DwdSources.vue';
import auth from './auth';
import store from './store';
import { DwdUtilsMixin } from './utils';
import './main.css';

Vue.use(VueRouter);
Vue.mixin(DwdUtilsMixin);

Vue.directive('auto-resize', {
  bind: function (el, binding, vnode) {
    let model = find(vnode.data.directives, (d) => d.name === 'model');
    vnode.context.$watch(model.expression, function () {
      el.style.height = el.scrollHeight + 'px';
    });
  },
});

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
      { path: '/sources', component: DwdSources },
      { path: '/source/:sourceId', component: DwdSource },
    ],
  }),
  created: function () {
    this.$store.commit('setUser', auth.getUser());
    this.$store.dispatch('load');
  },
});
