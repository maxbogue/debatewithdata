<template>
<div>
  <router-link v-if="trail && claim && claim.id"
               :to="claimUrl(claim.id, trail)"
               class="link-icon fas fa-link" />
  <span v-if="trail && claim && !claim.id"
        class="link-icon fas fa-arrow-circle-up"></span>
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
    trail: { type: Array, default: null },
  },
  computed: {
    errorMessage: function () {
      return itemErrorMessage(this.claim);
    },
  },
};
</script>
