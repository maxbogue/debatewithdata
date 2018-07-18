<template>
<router-link :to="addTo" class="fas fa-plus-square" />
</template>

<script>
export default {
  props: {
    type: { type: String, required: true },
    id: { type: String, required: true },
    extras: { type: Object, default: () => ({}) },
  },
  computed: {
    addTo: function () {
      return {
        name: this.type + 'Edit',
        params: {
          id: this.id,
          ...this.extras,
        },
      };
    },
  },
};
</script>
