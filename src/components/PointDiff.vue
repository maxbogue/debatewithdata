<template>
<div>
  <point-content v-if="hasBoth" :point="curr" />
  <template v-else>
    <point-content v-if="hasPrev" :point="prev" class="del" />
    <point-content v-if="hasCurr" :point="curr" class="ins" />
  </template>
</div>
</template>

<script>
import PointContent from './PointContent.vue';

export default {
  components: {
    PointContent,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  computed: {
    hasPrev() {
      return this.prev && this.prev.pointType;
    },
    hasCurr() {
      return this.curr && this.curr.pointType;
    },
    hasBoth() {
      return this.hasPrev && this.hasCurr;
    },
  },
};
</script>
