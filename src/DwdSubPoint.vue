<template>
<li :class="['side-' + side]">
  <span v-if="error">{{ error }}</span>
  <router-link v-else :to="url">{{ text }}</router-link>
</li>
</template>

<script>
export default {
  props: ['point', 'side'],
  computed: {
    claim: function () {
      return this.$store.state.claims[this.point.claim];
    },
    source: function () {
      return this.$store.state.sources[this.point.source];
    },
    url: function () {
      if (this.point.claim) {
        return this.claimUrl(this.point.claim);
      } else if (this.point.source) {
        return this.sourceUrl(this.point.source);
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
      if (this.point.claim && !this.claim) {
        return 'Claim not found: ' + this.point.claim;
      } else if (this.point.source && !this.source) {
        return 'Source not found: ' + this.point.source;
      }
      return '';
    },
  },
};
</script>

<style>
</style>
