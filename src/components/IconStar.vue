<template>
  <span
    :class="[$style.star, { click: user }]"
    :title="item.starCount + ' stars'"
    @click="toggle"
  >
    <span class="fa-star" :class="item.starred ? 'fas' : 'far'"></span>
    <span class="mono" :class="$style.count">{{ item.starCount }}</span>
  </span>
</template>

<script>
export default {
  props: {
    type: { type: String, required: true },
    item: { type: Object, required: true },
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async toggle() {
      if (!this.user) {
        return;
      }
      await this.$store.dispatch('toggleStar', {
        type: this.type,
        id: this.item.id,
      });
    },
  },
};
</script>

<style lang="scss" module>
.star {
  display: flex;
  align-items: center;
}

.count {
  font-size: 0.8em;
}
</style>
