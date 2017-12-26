<template>
<claim-content v-if="claim" :claim="claim" :trail="[]" />
<source-content v-else-if="source" :source="source" :trail="[]" />
<claim-content v-else :claim="rev"></claim-content>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';

export default {
  components: {
    ClaimContent,
    SourceContent,
  },
  props: {
    rev: {
      type: Object,
      required: true,
    },
  },
  computed: {
    claim: function () {
      if (this.rev.type !== 'claim') {
        return null;
      }
      return {
        id: this.rev.claimId,
        text: this.rev.text,
      };
    },
    source: function () {
      if (this.rev.type !== 'source') {
        return null;
      }
      return {
        id: this.rev.sourceId,
        text: this.rev.text,
        url: this.rev.url,
      };
    },
  },
};
</script>
