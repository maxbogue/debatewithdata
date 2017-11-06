<template>
<li class="t3 flex-row" :class="[side === 0 ? 'for' : 'against']">
  <span v-if="error">{{ error }}</span>
  <router-link v-else-if="point.type === 'claim'"
               :to="url">{{ text }}</router-link>
  <source-content v-else-if="point.type === 'source'"
                  :source="source"
                  :trail="trail"></source-content>
  <template v-else>{{ text }}</template>
</li>
</template>

<script>
import './style/sub-point.css';
import SourceContent from './SourceContent.vue';

export default {
  components: {
    SourceContent,
  },
  props: ['point', 'side', 'trail'],
  computed: {
    claim: function () {
      if (this.point.type === 'claim') {
        return this.$store.state.claims[this.point.claimId];
      }
      if (this.point.type === 'text' || this.point.type === 'subclaim') {
        return this.point;
      }
      return null;
    },
    source: function () {
      if (this.point.type !== 'source') {
        return null;
      }
      return this.$store.state.sources[this.point.sourceId];
    },
    url: function () {
      if (this.claim) {
        return this.claimUrl(this.point.claimId, this.trail);
      } else if (this.source) {
        return this.sourceUrl(this.point.sourceId, this.trail);
      }
      return '';
    },
    text: function () {
      if (this.claim) {
        return this.claim.text;
      } else if (this.source) {
        return this.source.text;
      }
      return '';
    },
    error: function () {
      if (this.point.type === 'claim' && !this.claim) {
        return 'Claim not found: ' + this.point.claimId;
      } else if (this.point.type === 'source' && !this.source) {
        return 'Source not found: ' + this.point.sourceId;
      }
      return '';
    },
  },
};
</script>
