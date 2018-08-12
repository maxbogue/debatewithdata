<template>
<div class="point" :class="isFor | toSideString">
  <router-link :to="url" class="bubble click">
    <point-diff :curr="curr" :prev="prev" />
  </router-link>
</div>
</template>

<script>
import '../style/point.scss';
import PointDiff from './PointDiff.vue';

export default {
  components: {
    PointDiff,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
    isFor: { type: Boolean, required: true },
    trail: { type: Array, required: true },
  },
  computed: {
    id() {
      return this.curr ? this.curr.id : this.prev.id;
    },
    url() {
      let type = this.curr ? this.curr.pointType : this.prev.pointType;
      return this.itemUrl(type, this.id, this.trail);
    },
  },
};
</script>
