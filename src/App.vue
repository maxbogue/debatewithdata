<template>
<div>
  <dwd-header />
  <error-modal />
  <router-view v-if="!suppressRoutes" class="dwd-container" />
  <dwd-loader :loading="loading" :error="loadingError" />
  <dwd-footer v-if="!loading" />
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdFooter from './components/DwdFooter.vue';
import DwdHeader from './components/DwdHeader.vue';
import DwdLoader from './components/DwdLoader.vue';
import ErrorModal from './components/ErrorModal.vue';

export default {
  components: {
    DwdFooter,
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
