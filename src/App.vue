<template>
<div>
  <dwd-header />
  <error-modal />
  <router-view v-if="!suppressRoutes" class="dwd-container" />
  <dwd-loader :loading="loading" :error="loadingError" />
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdHeader from './DwdHeader.vue';
import DwdLoader from './DwdLoader.vue';
import ErrorModal from './ErrorModal.vue';

export default {
  components: {
    DwdHeader,
    DwdLoader,
    ErrorModal,
  },
  computed: {
    ...mapState([
      'loading',
      'loadingError',
      'suppressRoutes',
    ]),
  },
};
</script>
