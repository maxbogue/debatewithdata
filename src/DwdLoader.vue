<template>
<div v-if="loading" :class="$style.loader">
  <loading-animation />
</div>
<div v-else-if="error" :class="[$style.loader, $style.error]">
  {{ error }}
</div>
<div v-else></div>
</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';

export default {
  components: {
    LoadingAnimation,
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

<style lang="scss" module>
@import "style/constants";

.loader {
  height: 40px;
  margin: 25px 0;
  clear: both;
  text-align: center;

  &.error {
    color: $red-dark-primary;
    font-size: 1.1em;
  }
}
</style>
