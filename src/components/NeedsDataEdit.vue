<template>
<div :class="$style.needsData">
  <select v-model="needsData">
    <option value="null">Analyze Points (default)</option>
    <option value="true">Needs Data (override)</option>
    <option value="false">Self-Evident (override)</option>
  </select>
</div>
</template>

<script>
export default {
  props: {
    value: { type: Boolean, default: null },
  },
  computed: {
    needsData: {
      get() {
        return String(this.value);
      },
      set(val) {
        if (val === String(true)) {
          this.$emit('input', true);
        } else if (val === String(false)) {
          this.$emit('input', false);
        } else {
          this.$emit('input', null);
        }
      },
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.needsData {
  flex: 1;

  select {
    font-size: 0.8em;
    font-weight: $font-weight-normal;
  }
}
</style>
