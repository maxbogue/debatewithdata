<template>
<span :class="[$style.star, { click: user }]"
      :title="item.starCount + ' stars'"
      @click="toggle">
  <span class="fa-star"
        :class="item.starred ? 'fas' : 'far'"></span>
  <span class="mono"
        :class="$style.count">{{ item.starCount }}</span>
</span>
</template>

<script>
export default {
  props: {
    item: { type: Object, required: true },
    url: { type: String, required: true },
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
      let res = await this.$http.post(this.url + '/star');
      this.item.starCount = res.data.starCount;
      this.item.starred = res.data.starred;
      this.item.watched = res.data.watched;
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
