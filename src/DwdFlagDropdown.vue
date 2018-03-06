<template>
<div :class="$style.flagDropdown">
  <ul :class="[$style.flags, { [$style.open]: showFlags }]">
    <li v-for="(v, k) in flags"
        :class="{ [$style.selected]: k === value }"
        :key="k"
        @click="selectFlag(k)">{{ v.name }}</li>
  </ul>
  <span class="click fas fa-flag"
        @click="showFlags = !showFlags"></span>
</div>
</template>

<script>
import { FlagData } from '../common/flag';

export default {
  props: {
    value: { type: String, required: true },
  },
  data: () => ({
    showFlags: false,
  }),
  computed: {
    flags: function () {
      return FlagData;
    },
  },
  methods: {
    selectFlag: function (flag) {
      this.$emit('input', flag === this.value ? '' : flag);
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.flagDropdown {
  display: flex;
}

.flags {
  background-color: $background-light;
  border: 1px solid $background-dark;
  box-shadow: 0 8px 16px 0 $transparent-light;
  color: $text-dark;
  margin-right: 8px;
  max-height: 0;
  max-width: 0;
  overflow: hidden;
  padding: 0;
  transition: max-height 0.5s, max-width 0.5s, visibility 0s 0.5s;
  visibility: hidden;
  z-index: 1;

  &.open {
    transition: max-height 0.5s, max-width 0.5s, visibility 0s;
    visibility: visible;
    max-height: 500px;
    max-width: 160px;
  }

  li {
    cursor: pointer;
    font-size: 12px;
    list-style: none;
    padding: 4px;

    &:hover {
      background-color: $red-accent;
    }

    &.selected {
      background-color: $red-dark-primary;
      color: $text-light;
    }

    &:hover.selected {
      background-color: $red-dark-accent;
    }
  }
}
</style>
