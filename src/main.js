import Vue from 'vue';
import VueRouter from 'vue-router';

import DwdApp from './DwdApp.vue';
import DwdDebate from './DwdDebate.vue';

Vue.use(VueRouter);

new Vue({
  el: '#app',
  components: { DwdApp },
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: DwdDebate },
    ],
  }),
});
