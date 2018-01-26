import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import find from 'lodash/find';
import Vue from 'vue';
import VueRouter from 'vue-router';

import './style/index.sass';
import Account from './pages/Account.vue';
import Activity from './pages/Activity.vue';
import Admin from './pages/Admin.vue';
import AppLayout from './AppLayout.vue';
import Claim from './pages/Claim.vue';
import ClaimEdit from './pages/ClaimEdit.vue';
import ClaimHistory from './pages/ClaimHistory.vue';
import Claims from './pages/Claims.vue';
import ForgotPassword from './pages/ForgotPassword.vue';
import Guide from './pages/Guide.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Logout from './pages/Logout.vue';
import Register from './pages/Register.vue';
import ResetPassword from './pages/ResetPassword.vue';
import Source from './pages/Source.vue';
import SourceEdit from './pages/SourceEdit.vue';
import SourceHistory from './pages/SourceHistory.vue';
import Sources from './pages/Sources.vue';
import Status from './pages/Status.vue';
import Topic from './pages/Topic.vue';
import TopicEdit from './pages/TopicEdit.vue';
import TopicHistory from './pages/TopicHistory.vue';
import Topics from './pages/Topics.vue';
import VerifyEmail from './pages/VerifyEmail.vue';
import auth from './auth';
import store from './store';
import { DwdUtilsMixin } from './utils';

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
  components: { AppLayout },
  store,
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: Home },
      { path: '/account', component: Account },
      { path: '/activity', component: Activity },
      { path: '/admin', component: Admin },
      { path: '/claim/:id', component: Claim },
      { path: '/claim/:id/edit', component: ClaimEdit },
      { path: '/claim/:id/history', component: ClaimHistory },
      { path: '/claim/:id/rev/:revId', component: ClaimHistory },
      { path: '/claims', component: Claims },
      { path: '/claims/add', component: ClaimEdit },
      { path: '/forgot-password', component: ForgotPassword },
      { path: '/guide', component: Guide },
      { path: '/login', component: Login },
      { path: '/logout', component: Logout },
      { path: '/register', component: Register },
      { path: '/reset-password', component: ResetPassword },
      { path: '/source/:id', component: Source },
      { path: '/source/:id/edit', component: SourceEdit },
      { path: '/source/:id/history', component: SourceHistory },
      { path: '/source/:id/rev/:revId', component: SourceHistory },
      { path: '/sources', component: Sources },
      { path: '/sources/add', component: SourceEdit },
      { path: '/status', component: Status },
      { path: '/topic/:id', component: Topic },
      { path: '/topic/:id/edit', component: TopicEdit },
      { path: '/topic/:id/history', component: TopicHistory },
      { path: '/topic/:id/rev/:revId', component: TopicHistory },
      { path: '/topics', component: Topics },
      { path: '/topics/add', component: TopicEdit },
      { path: '/verify-email', component: VerifyEmail },
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
