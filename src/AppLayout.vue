<template>
<div>
  <dwd-header />
  <error-modal />
  <router-view class="dwd-container" />
</div>
</template>

<script>
import DwdHeader from './DwdHeader.vue';
import ErrorModal from './ErrorModal.vue';

export default {
  components: {
    DwdHeader,
    ErrorModal,
  },
};
</script>
