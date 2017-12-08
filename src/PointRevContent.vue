<template>
<div v-if="rev.type === 'claim'">
  <span class="mono">{{ rev.claimId }}</span>: {{ rev.text }}
</div>
<div v-else-if="rev.type === 'source'">
  <span class="mono">{{ rev.sourceId }}</span>: {{ rev.text }}
</div>
<claim-content v-else :claim="rev"></claim-content>
</template>

<script>
import ClaimContent from './ClaimContent.vue';

export default {
  components: {
    ClaimContent,
  },
  props: {
    rev: {
      type: Object,
      required: true,
    },
  },
};
</script>
