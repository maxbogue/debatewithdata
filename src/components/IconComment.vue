<template>
  <span class="click">
    <span class="far fa-comment"></span>
    <span class="mono" :class="$style.count">{{ count }}</span>
  </span>
</template>

<script>
export default {
  props: {
    count: { type: Number, required: true },
  },
};
</script>

<style lang="scss" module>
.comment-icon {
  display: flex;
  align-items: center;
}

.count {
  font-size: 0.8em;
}
</style>
