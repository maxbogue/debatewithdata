<template>
<router-link :to="editUrl" class="fas fa-edit click" />
</template>

<script>
export default {
  props: {
    url: { type: String, required: true },
  },
  computed: {
    editUrl() {
      return this.appendToUrl(this.url, '/edit');
    },
  },
};
</script>
