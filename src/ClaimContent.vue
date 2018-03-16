<template>
<div>
  <template v-if="claim && !claim.deleted">
    <dwd-flag v-if="claim.flag" :flag="claim.flag" />
    <span>{{ claim.text }}</span>
  </template>
  <em v-else class="error">{{ errorMessage }}</em>
</div>
</template>

<script>
import DwdFlag from './DwdFlag.vue';
import { itemErrorMessage } from './utils';

export default {
  components: {
    DwdFlag,
  },
  props: {
    claim: { type: Object, required: true },
  },
  computed: {
    errorMessage: function () {
      return itemErrorMessage(this.claim);
    },
  },
};
</script>
