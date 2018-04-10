<template>
<span :class="[$style.star, { click: user }]"
      :title="star.count + ' stars'"
      @click="toggle">
  <span class="fa-star"
        :class="star.starred ? 'fas' : 'far'"></span>
  <span class="mono"
        :class="$style.count">{{ star.count }}</span>
</span>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    star: { type: Object, required: true },
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
        this.star.count = response.data.star.count;
        this.star.starred = response.data.star.starred;
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
