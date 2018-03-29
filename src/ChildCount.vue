<template>
<span v-if="item.childCount > 0"
      class="mono"
      :class="$style.count">+{{ item.childCount }}</span>
</template>

<script>
export default {
  props: {
    item: { type: Object, required: true },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.count {
  margin: -8px -8px 8px 8px;
  float: right;
  color: $transparent-light;
  font-size: 0.8em;
}
</style>
