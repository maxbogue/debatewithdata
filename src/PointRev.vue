<template>
<div class="point" :class="isFor | toSideString">
  <point-diff class="bubble click"
              :curr="curr"
              :prev="prev"
              @click.native="showDrawer = !showDrawer" />
  <div class="info">
    <span class="id mono">{{ id }}</span>
  </div>
</div>
</template>

<script>
import './style/point.scss';
import PointDiff from './PointDiff.vue';

export default {
  components: {
    PointDiff,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
    isFor: { type: Boolean, required: true },
  },
  computed: {
    id: function () {
      return this.curr ? this.curr.id : this.prev.id;
    },
  },
};
</script>
