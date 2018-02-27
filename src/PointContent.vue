<template>
<div>
  <claim-content v-if="point.type === 'claim'"
                 :claim="claim"
                 :trail="trail" />
  <source-content v-else-if="point.type === 'source'"
                  :source="source"
                  :trail="trail" />
  <source-content v-else-if="point.type === 'newSource'"
                  :source="point.source"
                  :trail="trail" />
  <claim-content v-else :claim="point" />
</div>
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
    point: { type: Object, required: true },
    trail: { type: Array, default: null },
  },
  computed: {
    claim: function () {
      if (this.point.type !== 'claim') {
        return null;
      }
      return this.$store.state.claims[this.point.claimId];
    },
    source: function () {
      if (this.point.type !== 'source') {
        return null;
      }
      return this.$store.state.sources[this.point.sourceId];
    },
  },
};
</script>
