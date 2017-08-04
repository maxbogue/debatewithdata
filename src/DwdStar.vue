<template>
<span v-if="user"
      class="glyphicon"
      :class="classes"
      @click="toggle"
      aria-hidden="true"></span>
</template>

<script>
export default {
  props: ['type', 'id'],
  computed: {
    star: function () {
      return this.$store.state.stars[this.type][this.id];
    },
    user: function () {
      return this.$store.state.user;
    },
    starred: function () {
      return this.user && this.star && this.star.starred;
    },
    classes: function () {
      return {
        'glyphicon-star': this.starred,
        'glyphicon-star-empty': !this.starred,
        'disabled': !this.star || !this.user,
        'click': this.user,
      };
    },
  },
  methods: {
    toggle: function () {
      if (!this.user) {
        return;
      }
      this.$store.dispatch('toggleStar', { type: this.type, id: this.id });
    },
  },
};
</script>

<style>
.disabled {
  color: rgba(0, 0, 0, 0.1);
}
</style>
