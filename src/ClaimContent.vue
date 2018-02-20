<template>
<div>
  <router-link v-if="trail && claim && claim.id"
               :to="claimUrl(claim.id, trail)"
               class="link-icon fas fa-link"></router-link>
  <template v-if="claim && !claim.deleted">
    <dwd-flag v-if="claim.flag" :flag="claim.flag" />
    <span>{{ claim.text }}</span>
  </template>
  <em v-else class="error">[{{ claim ? 'deleted' : 'not found' }}]</em>
</div>
</template>

<script>
import DwdFlag from './DwdFlag.vue';

export default {
  components: {
    DwdFlag,
  },
  props: {
    claim: { type: Object, required: true },
    trail: { type: Array, default: null },
  },
};
</script>
