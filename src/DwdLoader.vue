<template>
<div v-if="loading" class="loader">
  <div class="ball-pulse-sync">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
<div v-else-if="error" class="loader error">
  {{ error }}
</div>
<div v-else-if="fill" class="loader">
</div>
<div v-else></div>
</template>

<script>
import 'loaders.css/loaders.min.css';

export default {
  props: {
    fill: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    loading: false,
    error: '',
  }),
  methods: {
    setLoading: function (loading) {
      this.loading = loading;
      this.error = '';
    },
    setError: function (error) {
      this.error = error;
      this.loading = false;
    },
  },
};
</script>

<style lang="sass" scoped>
@import "style/constants"

.loader
  align-items: center
  display: flex
  height: 40px
  margin: 25px 0
  justify-content: center

  > div > div
    background-color: $loader-color
    border: none

  &.error
    color: $red-dark-primary
    font-size: 1.1em
    text-align: center
</style>
