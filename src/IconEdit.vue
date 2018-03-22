<template>
  <router-link :to="editUrl" class="fas fa-edit click" />
</template>

<script>
export default {
  props: {
    url: { type: String, required: true },
  },
  computed: {
    editUrl: function () {
      if (this.url.includes('?')) {
        return this.url.replace('?', '/edit?');
      }
      return this.url + '/edit';
    },
  },
};
</script>
