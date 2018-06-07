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
import axios from 'axios';

export default {
  props: {
    item: { type: Object, required: true },
    url: { type: String, required: true },
  },
  computed: {
    user: function () {
      return this.$store.state.user;
    },
  },
  methods: {
    toggle: function () {
      if (!this.user) {
        return;
      }
      axios.post(this.url + '/star').then((response) => {
        this.item.starCount = response.data.starCount;
        this.item.starred = response.data.starred;
        this.item.watched = response.data.watched;
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
