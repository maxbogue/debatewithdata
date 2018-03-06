<template>
<div :class="$style.flag">
  <span>Warning:</span>
  <a :href="'/guide#' + flag">{{ data.tldr }}</a>
</div>
</template>

<script>
import { FlagData } from '../common/flag';

export default {
  props: {
    flag: { type: String, required: true },
  },
  computed: {
    data: function () {
      return FlagData[this.flag];
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.flag {
  font-size: 12px;

  span {
    color: $red-dark-primary;
  }

  a:hover {
    text-decoration: underline;
  }
}
</style>
