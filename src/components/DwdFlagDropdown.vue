<template>
<div :class="$style.flagDropdown">
  <ul :class="[$style.flags, { [$style.open]: showFlags }]">
    <li v-for="[k, v] in flags"
        :class="{ [$style.selected]: k === value }"
        :key="k"
        @click="selectFlag(k)">{{ v.name }}</li>
  </ul>
  <span class="click fas fa-flag"
        @click="showFlags = !showFlags"></span>
</div>
</template>

<script>
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import { FlagData } from '@/common/flag';

export default {
  props: {
    value: { type: String, default: null },
  },
  data: () => ({
    showFlags: false,
  }),
  computed: {
    flags() {
      const flagList = map(FlagData, (v, k) => [k, v]);
      return sortBy(flagList, ([, v]) => v.name);
    },
  },
  methods: {
    selectFlag(flag) {
      this.$emit('input', flag === this.value ? null : flag);
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.flagDropdown {
  display: flex;
}

.flags {
  visibility: hidden;
  z-index: 1;
  max-width: 0;
  max-height: 0;
  margin-right: 8px;
  padding: 0;
  overflow: hidden;
  transition: visibility 0s 0.5s, max-width 0.5s, max-height 0.5s;
  border: 1px solid $background-dark;
  background-color: $background-light;
  box-shadow: 0 8px 16px 0 $transparent-light;
  color: $text-dark;

  &.open {
    visibility: visible;
    max-width: 160px;
    max-height: 500px;
    transition: visibility 0s, max-width 0.5s, max-height 0.5s;
  }

  li {
    padding: 4px;
    font-size: 12px;
    list-style: none;
    cursor: pointer;

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
