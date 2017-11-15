import axios from 'axios';
import find from 'lodash/find';
import Vue from 'vue';
import VueRouter from 'vue-router';

import DwdAccount from './DwdAccount.vue';
import DwdActivity from './DwdActivity.vue';
import DwdAdmin from './DwdAdmin.vue';
import DwdApp from './DwdApp.vue';
import DwdClaim from './DwdClaim.vue';
import DwdClaims from './DwdClaims.vue';
import DwdEditClaim from './DwdEditClaim.vue';
import DwdEditSource from './DwdEditSource.vue';
import DwdForgotPassword from './DwdForgotPassword.vue';
import DwdStatus from './DwdStatus.vue';
import DwdGuide from './DwdGuide.vue';
import DwdHome from './DwdHome.vue';
import DwdLogin from './DwdLogin.vue';
import DwdLogout from './DwdLogout.vue';
import DwdRegister from './DwdRegister.vue';
import DwdResetPassword from './DwdResetPassword.vue';
import DwdSource from './DwdSource.vue';
import DwdSources from './DwdSources.vue';
import DwdVerifyEmail from './DwdVerifyEmail.vue';
import auth from './auth';
import store from './store';
import { DwdUtilsMixin } from './utils';
import './style/index.sass';

Vue.use(VueRouter);
Vue.mixin(DwdUtilsMixin);

Vue.directive('auto-resize', {
  bind: function (el, binding, vnode) {
    let model = find(vnode.data.directives, (d) => d.name === 'model');
    vnode.context.$watch(model.expression, function () {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  },
});

function httpErrorToString(error) {
  if (!error.response) {
    return 'Server not responding';
  } else if (error.response.status >= 500) {
    return 'Server error';
  }
  return error.response.data.message;
}

function axiosError(err) {
  if (err.config && err.config.loader) {
    err.config.loader.setError(httpErrorToString(err));
  }
  return Promise.reject(err);
}

new Vue({
  el: '#app',
  components: { DwdApp },
  store,
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: DwdHome },
      { path: '/account', component: DwdAccount },
      { path: '/activity', component: DwdActivity },
      { path: '/admin', component: DwdAdmin },
      { path: '/claim/:id', component: DwdClaim },
      { path: '/claim/:id/edit', component: DwdEditClaim },
      { path: '/claims', component: DwdClaims },
      { path: '/claims/add', component: DwdEditClaim },
      { path: '/forgot-password', component: DwdForgotPassword },
      { path: '/guide', component: DwdGuide },
      { path: '/login', component: DwdLogin },
      { path: '/logout', component: DwdLogout },
      { path: '/register', component: DwdRegister },
      { path: '/reset-password', component: DwdResetPassword },
      { path: '/source/:id', component: DwdSource },
      { path: '/source/:id/edit', component: DwdEditSource },
      { path: '/sources', component: DwdSources },
      { path: '/sources/add', component: DwdEditSource },
      { path: '/status', component: DwdStatus },
      { path: '/verify-email', component: DwdVerifyEmail },
    ],
  }),
  created: function () {
    this.$store.commit('setUser', auth.getUser());
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
    window.onclick = function(event) {
      if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
          dropdowns[i].classList.remove('open');
        }
      }
    };
  },
});
