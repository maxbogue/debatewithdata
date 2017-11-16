<template>
<span :class="$style.star">
  <span class="glyphicon"
        :class="classes"
        :title="star.count + ' stars'"
        @click="toggle"
        aria-hidden="true"></span>
  <span class="mono"
        :class="$style.count">{{ star.count }}</span>
</span>
</template>

<script>
import axios from 'axios';

export default {
  props: ['star', 'url'],
  computed: {
    user: function () {
      return this.$store.state.user;
    },
    classes: function () {
      return [
        this.star.starred ? 'glyphicon-star' : 'glyphicon-star-empty',
        this.user ? 'click' : this.$style.disabled,
      ];
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

<style lang="sass" module>
.star
  display: flex
  align-items: center

.disabled
  color: rgba(0, 0, 0, 0.1)

.count
  font-size: 0.8em
</style>
