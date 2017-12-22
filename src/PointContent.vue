<template>
<div>
  <claim-content v-if="point.type === 'claim'"
                 :claim="claim"
                 :trail="trail"></claim-content>
  <source-content v-else-if="point.type === 'source'"
                  :source="source"
                  :trail="trail"></source-content>
  <claim-content v-else :claim="point"></claim-content>
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
    point: {
      type: Object,
      required: true,
    },
    trail: {
      type: Array,
      required: true,
    },
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
