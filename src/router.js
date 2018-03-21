import Vue from 'vue';
import VueRouter from 'vue-router';

import Account from './pages/Account.vue';
import Activity from './pages/Activity.vue';
import Admin from './pages/Admin.vue';
import Claim from './pages/Claim.vue';
import ClaimEdit from './pages/ClaimEdit.vue';
import Claims from './pages/Claims.vue';
import ForgotPassword from './pages/ForgotPassword.vue';
import Guide from './pages/Guide.vue';
import History from './pages/History.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Logout from './pages/Logout.vue';
import Point from './pages/Point.vue';
import Register from './pages/Register.vue';
import ResetPassword from './pages/ResetPassword.vue';
import Source from './pages/Source.vue';
import SourceEdit from './pages/SourceEdit.vue';
import Sources from './pages/Sources.vue';
import Status from './pages/Status.vue';
import Topic from './pages/Topic.vue';
import TopicEdit from './pages/TopicEdit.vue';
import Topics from './pages/Topics.vue';
import VerifyEmail from './pages/VerifyEmail.vue';
import store from './store';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/:type/:id/history', component: History },
    { path: '/:type/:id/rev/:revId', component: History },
    { path: '/account', component: Account },
    { path: '/activity', component: Activity },
    { path: '/admin', component: Admin },
    { path: '/claim/:id', component: Claim },
    {
      path: '/claim/:id/edit',
      name: 'claimEdit',
      component: ClaimEdit,
      props: true,
    },
    { path: '/claims', component: Claims },
    { path: '/claims/add', component: ClaimEdit },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/guide', component: Guide },
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/point/:id', component: Point, props: true },
    { path: '/register', component: Register },
    { path: '/reset-password', component: ResetPassword },
    { path: '/source/:id', component: Source },
    {
      path: '/source/:id/edit',
      name: 'sourceEdit',
      component: SourceEdit,
      props: true,
    },
    { path: '/sources', component: Sources },
    { path: '/sources/add', component: SourceEdit },
    { path: '/status', component: Status },
    { path: '/topic/:id', component: Topic },
    {
      path: '/topic/:id/edit',
      name: 'topicEdit',
      component: TopicEdit,
      props: true,
    },
    { path: '/topics', component: Topics },
    { path: '/topics/add', component: TopicEdit },
    { path: '/verify-email', component: VerifyEmail },
  ],
});

router.beforeEach((to, from, next) => {
  store.commit('storeItemBlockLocations');
  next();
});

export default router;
