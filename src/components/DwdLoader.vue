<template>
<div v-if="innerLoading" :class="$style.loader">
  <loading-animation />
</div>
<div v-else-if="innerError" :class="[$style.loader, $style.error]">
  {{ innerError }}
</div>
<div v-else></div>
</template>

<script>
import LoadingAnimation from './LoadingAnimation.vue';

export default {
  components: {
    LoadingAnimation,
  },
  props: {
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  data: () => ({
    loadingOverride: false,
    errorOverride: '',
  }),
  computed: {
    innerLoading() {
      return this.loadingOverride || this.loading;
    },
    innerError() {
      return this.errorOverride || this.error;
    },
  },
  methods: {
    setLoading(loading) {
      this.loadingOverride = loading;
      this.errorOverride = '';
    },
    setError(error) {
      this.errorOverride = error;
      this.loadingOverride = false;
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.loader {
  margin: 25px 0;
  clear: both;
  text-align: center;

  &.error {
    color: $red-dark-primary;
    font-size: 1.1em;
  }
}
</style>
