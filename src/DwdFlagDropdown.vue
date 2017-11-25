<template>
<span class="dropdown">
  <span class="dropdown-toggle click glyphicon glyphicon-flag"
        aria-hidden="true"
        @click="toggleDropdown"></span>
  <ul ref="flags" :class="$style.flags" class="dropdown-content">
    <li v-for="(v, k) in flags"
        :class="{ [$style.selected]: k === flag }"
        :key="k"
        @click="selectFlag(k)">{{ v.name }}</li>
  </ul>
</span>
</template>

<script>
import { FlagData } from '../common/flag';

export default {
  props: ['flag'],
  computed: {
    flags: function () {
      return FlagData;
    },
  },
  methods: {
    toggleDropdown: function () {
      this.$refs.flags.classList.toggle('open');
    },
    selectFlag: function (flag) {
      this.$emit('select', flag === this.flag ? '' : flag);
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.flags
  background-color: $background-light
  border: 1px solid $background-dark
  color: $text-dark
  padding: 0

  li
    cursor: pointer
    font-size: 12px
    list-style: none
    padding: 4px

    &:hover
      background-color: $red-accent

    &.selected
      background-color: $red-dark-primary
      color: $text-light

    &:hover.selected
      background-color: $red-dark-accent
</style>
