<template>
<div>
  <router-link v-if="trail && claim"
               :to="claimUrl(claim.id, trail)"
               class="link-icon glyphicon glyphicon-link"></router-link>
  <template v-if="claimHasContent">
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
    claim: {
      type: Object,
      required: true,
    },
    trail: {
      type: Array,
      required: false,
    },
  },
  computed: {
    claimHasContent: function () {
      return this.claim && !this.claim.deleted;
    },
  },
};
</script>
