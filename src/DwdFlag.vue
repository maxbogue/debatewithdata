<template>
<div class="flag">
  <span>Warning:</span>
  <a :href="'/guide#' + flag">{{ data.tldr }}</a>
</div>
</template>

<script>
import { FlagData } from '../common/flag';

export default {
  props: ['flag'],
  computed: {
    data: function () {
      return FlagData[this.flag];
    },
  },
};
</script>

<style lang="sass" scoped>
.flag
  font-size: 12px

  span
    color: #D32F2F
    text-decoration: underline

  a:hover
    text-decoration: underline
</style>
