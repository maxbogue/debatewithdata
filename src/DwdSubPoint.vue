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
      if (this.point.type !== 'claim') return null;
      return this.$store.state.claims[this.point.id];
    },
    source: function () {
      if (this.point.type !== 'source') return null;
      return this.$store.state.sources[this.point.id];
    },
    url: function () {
      if (this.claim) {
        return this.claimUrl(this.point.id);
      } else if (this.source) {
        return this.sourceUrl(this.point.id);
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
        return 'Claim not found: ' + this.point.id;
      } else if (this.point.type === 'source' && !this.source) {
        return 'Source not found: ' + this.point.id;
      }
      return '';
    },
  },
};
</script>

<style>
</style>
