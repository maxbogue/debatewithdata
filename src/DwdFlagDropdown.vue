<template>
<div class="dropdown">
  <span class="dropdown-toggle click glyphicon glyphicon-flag"
        aria-hidden="true"
        @click="toggleDropdown"></span>
  <ul ref="flags" class="flags dropdown-content">
    <li v-for="(v, k) in flags"
        :class="{ selected: k === flag }"
        :key="k"
        @click="selectFlag(k)">{{ v.name }}</li>
  </ul>
</div>
</template>

<script>
import { FLAGS } from './utils';

export default {
  props: ['flag'],
  computed: {
    flags: function () {
      return FLAGS;
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

<style lang="sass" scoped>
.flags
  background-color: #fefefe
  border: 1px solid #666
  padding: 0

  li
    cursor: pointer
    font-size: 12px
    list-style: none
    padding: 4px

    &:hover
      background-color: #EF9A9A
      color: #212121

  .selected
    background-color: #D32F2F
    color: #fff
</style>
