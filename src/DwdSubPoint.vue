<template>
<li class="t3 flex-row" :class="[side === 0 ? 'for' : 'against']">
  <span v-if="error">{{ error }}</span>
  <router-link v-else-if="point.type === 'claim'"
               :to="url">{{ text }}</router-link>
  <template v-else-if="source">
    <span v-if="ary">{{ ary }}&nbsp;</span>
    <router-link :to="url">{{ text }}</router-link>
  </template>
  <template v-else>{{ text }}</template>
</li>
</template>

<script>
export default {
  props: ['point', 'side'],
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
        return this.claimUrl(this.point.claimId);
      } else if (this.source) {
        return this.sourceUrl(this.point.sourceId);
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
    ary: function () {
      if (!this.source) {
        return '';
      } else if (this.source.ary === 1) {
        return '①';
      } else if (this.source.ary === 2) {
        return '②';
      } else if (this.source.ary === 3) {
        return '③';
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

<style>
.t3 {
  list-style: none;
  margin-top: 8px;
  padding: 0;
}
.t3:before {
  color: rgba(0, 0, 0, 0.65);
  font-family: 'Glyphicons Halflings';
  margin-right: 4px;
}
.t3.for:before {
  content: "\e081";
}
.t3.against:before {
  content: "\e082";
}
</style>
