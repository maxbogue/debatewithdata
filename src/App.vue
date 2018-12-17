<template>
  <div id="app">
    <dwd-header />
    <error-modal />
    <router-view v-if="!suppressRoutes" class="dwd-container" />
    <dwd-loader :loading="loading" :error="loadingError" />
    <dwd-footer v-if="!loading" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import DwdFooter from '@/components/DwdFooter.vue';
import DwdHeader from '@/components/DwdHeader.vue';
import DwdLoader from '@/components/DwdLoader.vue';
import ErrorModal from '@/components/ErrorModal.vue';

export default {
  components: {
    DwdFooter,
    DwdHeader,
    DwdLoader,
    ErrorModal,
  },
  metaInfo() {
    return {
      title: '',
      titleTemplate: '%s - DebateWithData',
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: "A crowdsourced reference for the world's discussions.",
        },
        {
          vmid: 'og:title',
          name: 'og:title',
          content: 'DebateWithData',
        },
        {
          vmid: 'og:url',
          name: 'og:url',
          content: `https://debatewithdata.org${this.$route.fullPath}`,
        },
        {
          vmid: 'og:description',
          name: 'og:description',
          content: "A crowdsourced reference for the world's discussions.",
        },
      ],
    };
  },
  computed: {
    ...mapState('substates', ['loading', 'loadingError', 'suppressRoutes']),
  },
};
</script>
