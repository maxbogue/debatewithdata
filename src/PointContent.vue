<template>
<div>
  <template v-if="point.type === 'claim'">
    <dwd-flag v-if="claim.flag" :flag="claim.flag"></dwd-flag>
    <router-link :to="claimUrl(claim.id, trail)"
                 class="source-text">{{ claim.text }}</router-link>
  </template>
  <source-content v-else-if="point.type === 'source'"
                  :source="source"
                  :trail="trail"></source-content>
  <template v-else>
    <dwd-flag v-if="point.flag" :flag="point.flag"></dwd-flag>
    <span class="source-text">{{ point.text }}</span>
  </template>
</div>
</template>

<script>
import DwdFlag from './DwdFlag.vue';
import SourceContent from './SourceContent.vue';

export default {
  components: {
    DwdFlag,
    SourceContent,
  },
  props: ['point', 'trail'],
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
