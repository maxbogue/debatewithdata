<template>
<span v-if="user"
      class="glyphicon"
      :class="classes"
      @click="toggle"
      aria-hidden="true"></span>
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
        this.user ? 'click' : 'disabled',
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

<style>
.disabled {
  color: rgba(0, 0, 0, 0.1);
}
</style>
