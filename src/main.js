import Vue from 'vue';
import VueRouter from 'vue-router';

import DwdDebate from './DwdDebate.vue';
import DwdHeader from './DwdHeader.vue';

Vue.use(VueRouter);

new Vue({
  el: '#app',
  components: { DwdHeader },
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: DwdDebate },
    ],
  }),
});
