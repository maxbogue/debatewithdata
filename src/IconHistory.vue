<template>
  <router-link :to="historyUrl" class="fas fa-clock click" />
</template>

<script>
export default {
  props: {
    url: { type: String, required: true },
  },
  computed: {
    historyUrl: function () {
      return this.appendToUrl(this.url, '/history');
    },
  },
};
</script>
