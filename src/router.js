import Vue from 'vue';
import VueRouter from 'vue-router';
import dropWhile from 'lodash/dropWhile';

import About from './pages/About.vue';
import Account from './pages/Account.vue';
import Activity from './pages/Activity.vue';
import Admin from './pages/Admin.vue';
import Claim from './pages/Claim.vue';
import Contact from './pages/Contact.vue';
import ForgotPassword from './pages/ForgotPassword.vue';
import Guide from './pages/Guide.vue';
import Home from './pages/Home.vue';
import Items from './pages/Items.vue';
import Loading from './pages/Loading.vue';
import Login from './pages/Login.vue';
import Logout from './pages/Logout.vue';
import NotFound from './pages/NotFound.vue';
import Notifications from './pages/Notifications.vue';
import Register from './pages/Register.vue';
import ResetPassword from './pages/ResetPassword.vue';
import Source from './pages/Source.vue';
import Topic from './pages/Topic.vue';
import User from './pages/User.vue';
import VerifyEmail from './pages/VerifyEmail.vue';
import { ItemType } from './common/constants';

const History = () =>
  import(/* webpackChunkName: "history" */ './pages/History.vue');

const ClaimEdit = () =>
  import(/* webpackChunkName: "edit" */ './pages/ClaimEdit.vue');
const SourceEdit = () =>
  import(/* webpackChunkName: "edit" */ './pages/SourceEdit.vue');
const TopicEdit = () =>
  import(/* webpackChunkName: "edit" */ './pages/TopicEdit.vue');

Vue.use(VueRouter);

const createRouterOptions = authRedirect => ({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/:type/:id/history', component: History },
    { path: '/:type/:id/rev/:revId', component: History },
    { path: '/about', component: About },
    {
      path: '/account',
      component: Account,
      beforeEnter: authRedirect,
    },
    { path: '/activity', component: Activity },
    { path: '/admin', component: Admin },
    { path: '/claim/:id', component: Claim },
    {
      path: '/claim/:id/edit',
      name: 'claimEdit',
      component: ClaimEdit,
      props: true,
      beforeEnter: authRedirect,
    },
    { path: '/claims', component: Items, props: { type: ItemType.CLAIM } },
    {
      path: '/claims/add',
      component: ClaimEdit,
      beforeEnter: authRedirect,
    },
    { path: '/contact', component: Contact },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/guide', component: Guide },
    { path: '/loading', component: Loading },
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/notifications', component: Notifications },
    { path: '/register', component: Register },
    { path: '/reset-password', component: ResetPassword },
    { path: '/data/:id', component: Source },
    {
      path: '/data/:id/edit',
      name: 'sourceEdit',
      component: SourceEdit,
      props: true,
      beforeEnter: authRedirect,
    },
    { path: '/datas', component: Items, props: { type: ItemType.SOURCE } },
    {
      path: '/datas/add',
      component: SourceEdit,
      beforeEnter: authRedirect,
    },
    { path: '/topic/:id', component: Topic },
    {
      path: '/topic/:id/edit',
      name: 'topicEdit',
      component: TopicEdit,
      props: true,
      beforeEnter: authRedirect,
    },
    { path: '/topics', component: Items, props: { type: ItemType.TOPIC } },
    {
      path: '/topics/add',
      component: TopicEdit,
      beforeEnter: authRedirect,
    },
    { path: '/user/:username', component: User, props: true },
    { path: '/verify-email', component: VerifyEmail },
    { path: '*', component: NotFound },
  ],
});

Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options;
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to,
      })
        .then(next)
        .catch(next);
    } else {
      next();
    }
  },
});

export function createRouter(auth, store) {
  function authRedirect(to, from, next) {
    if (!auth.getUser()) {
      next({ path: '/login', query: { next: to.fullPath } });
    } else {
      next();
    }
  }
  const router = new VueRouter(createRouterOptions(authRedirect));

  router.beforeEach((to, from, next) => {
    store.commit('storeItemBlockLocations');
    next();
  });

  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);
    const activated = dropWhile(matched, (c, i) => c === prevMatched[i]);

    let promises = [];

    for (let c of activated) {
      if (c.asyncData) {
        let promise = c.asyncData({ store, route: to });
        if (promise) {
          promises.push(promise);
        }
      }
    }

    if (promises.length === 0) {
      next();
      return;
    }

    store.commit('setSuppressRoutes', true);

    Promise.all(promises)
      .then(() => {
        next();
        store.commit('setSuppressRoutes', false);
      })
      .catch(next);
  });

  return router;
}
