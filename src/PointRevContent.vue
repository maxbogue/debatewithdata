<template>
<claim-content v-if="claim" :claim="claim" :trail="[]" />
<source-content v-else-if="source" :source="source" :trail="[]" />
<claim-content v-else :claim="rev"></claim-content>
</template>

<script>
import clone from 'lodash/clone';

import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';

export default {
  components: {
    ClaimContent,
    SourceContent,
  },
  props: {
    rev: { type: Object, required: true },
  },
  computed: {
    claim: function () {
      if (this.rev.type !== 'claim') {
        return null;
      } else if (this.rev.claim) {
        let claim = clone(this.rev.claim);
        claim.id = this.rev.claimId;
        return claim;
      }
      return this.lookupClaim(this.rev.claimId);
    },
    source: function () {
      if (this.rev.type !== 'source' && this.rev.type !== 'newSource') {
        return null;
      } else if (this.rev.source) {
        let source = clone(this.rev.source);
        source.id = this.rev.sourceId;
        return source;
      }
      return this.lookupSource(this.rev.sourceId);
    },
  },
};
</script>
