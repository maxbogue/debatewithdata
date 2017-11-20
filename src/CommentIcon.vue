<template>
<span :class="$style.star">
  <span class="glyphicon glyphicon-comment click"
        aria-hidden="true"></span>
  <span class="mono"
        :class="$style.count">{{ count }}</span>
</span>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style lang="sass" module>
.comment-icon
  display: flex
  align-items: center

.count
  font-size: 0.8em
</style>
