<template>
<div class="flag">
  <span>Logical fallacy warning:</span>
  <a :href="'https://yourlogicalfallacyis.com/' + flag"
     target="_blank">{{ name }}</a>
</div>
</template>

<script>
import { FLAGS } from './utils';

export default {
  props: ['flag'],
  computed: {
    name: function () {
      return FLAGS[this.flag].name;
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
