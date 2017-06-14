<template>
<li :class="['side-' + item.side]">
  <span v-if="error">{{ error }}</span>
  <router-link v-else :to="url">{{ text }}</router-link>
</li>
</template>

<script>
export default {
  props: ['item'],
  computed: {
    claim: function () {
      return this.$store.state.claims[this.item.claim];
    },
    source: function () {
      return this.$store.state.sources[this.item.source];
    },
    url: function () {
      if (this.item.claim) {
        return '/claim/' + this.item.claim;
      } else if (this.item.source) {
        return '/source/' + this.item.source;
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
      if (this.item.claim && !this.claim) {
        return 'Claim not found: ' + this.item.claim;
      } else if (this.item.source && !this.source) {
        return 'Source not found: ' + this.item.source;
      }
      return '';
    },
  },
};
</script>

<style>
</style>
