<template>
  <div>
    <template v-if="claim && !claim.deleted">
      <dwd-flag v-if="claim.flag" :flag="claim.flag" />
      <child-count v-if="isLink" :item="claim" />
      <span>{{ claim.text }}</span>
    </template>
    <em v-else class="error">{{ errorMessage }}</em>
  </div>
</template>

<script>
import { itemErrorMessage } from '@/utils';

import ChildCount from './ChildCount.vue';
import DwdFlag from './DwdFlag.vue';

export default {
  components: {
    ChildCount,
    DwdFlag,
  },
  props: {
    claim: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
    isLink: { type: Boolean, default: false },
  },
  computed: {
    errorMessage() {
      return itemErrorMessage(this.claim);
    },
  },
};
</script>
