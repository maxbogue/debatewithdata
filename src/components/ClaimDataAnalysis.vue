<template>
<div class="data-analysis">
  <span :class="classes">{{ text }}</span>
</div>
</template>

<script>
import some from 'lodash/some';

export default {
  props: {
    claim: { type: Object, required: true },
    noColor: { type: Boolean, default: false },
  },
  computed: {
    hasDirectFor: function () {
      return some(this.claim.sourceIds);
    },
    forCount: function () {
      if (!this.claim.dataCounts) {
        return 0;
      }
      return this.claim.dataCounts[0];
    },
    needsData: function () {
      return this.claim.needsData || this.forCount === 0;
    },
    classes: function () {
      if (this.noColor) {
        return {};
      }
      let needsData = this.claim.needsData || this.forCount === 0;
      return [needsData ? this.$style.bad : this.$style.good];
    },
    text: function () {
      if (this.claim.needsData) {
        return 'Missing Data (forced)';
      } else if (this.claim.needsData === false) {
        return 'Self-Evident';
      } else if (this.hasDirectFor) {
        return 'Has Data';
      } else if (this.forCount > 0) {
        return 'Has Data (nested)';
      }
      return 'Missing Data';
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.good {
  color: $transparent-light;
}

.bad {
  color: $red-dark-primary;
}
</style>
