<template>
<router-link :to="historyUrl" class="far fa-clock click" />
</template>

<script>
export default {
  props: {
    url: { type: String, required: true },
  },
  computed: {
    historyUrl() {
      return this.appendToUrl(this.url, '/history');
    },
  },
};
</script>
