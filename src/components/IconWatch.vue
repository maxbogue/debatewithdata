<template>
  <span
    class="fa-bell click"
    :class="item.watched ? 'fas' : 'far'"
    @click="toggle"
  ></span>
</template>

<script>
export default {
  props: {
    type: { type: String, required: true },
    item: { type: Object, required: true },
  },
  methods: {
    async toggle() {
      await this.$store.dispatch('toggleWatch', {
        type: this.type,
        id: this.item.id,
      });
    },
  },
};
</script>
