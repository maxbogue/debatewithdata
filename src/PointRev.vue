<template>
<li :class="pointClasses">
  <point-diff class="bubble click"
              :curr="curr"
              :prev="prev"
              @click.native="showDrawer = !showDrawer" />
  <dwd-drawer :show="showDrawer">
    <div class="info">
      <span class="id mono">{{ pointId }}</span>
    </div>
    <div v-if="subPointRevs.length > 0">
      <point-rev v-for="[[spId, currSp, prevSp], subSide] in subPointRevs"
                 :point-id="spId"
                 :curr="currSp"
                 :prev="prevSp"
                 :is-for="isFor === !subSide"
                 :is-sub-point="true"
                 :key="spId" />
    </div>
  </dwd-drawer>
</li>
</template>

<script>
import './style/point.scss';
import DwdDrawer from './DwdDrawer.vue';
import PointDiff from './PointDiff.vue';
import { diffPointRevs, rotateWithIndexes } from './utils';

export default {
  name: 'PointRev',
  components: {
    DwdDrawer,
    PointDiff,
  },
  props: {
    pointId: { type: String, required: true, },
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
    isFor: { type: Boolean, required: true },
    isSubPoint: { type: Boolean, default: false },
  },
  data: () => ({
    showDrawer: false,
  }),
  computed: {
    pointClasses: function () {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
    subPointRevs: function () {
      if (this.isSubPoint) {
        return [];
      }
      return rotateWithIndexes(diffPointRevs(this.curr, this.prev));
    },
    hasChangedSubPoints: function () {
      let isChanged = (val) => val[0][1] !== val[0][2];
      let anyChanged = (acc, val) => acc || isChanged(val);
      return this.subPointRevs.reduce(anyChanged, false);
    },
  },
  watch: {
    hasChangedSubPoints: function () {
      this.showDrawer = this.hasChangedSubPoints;
    },
  },
  mountedTriggersWatchers: true,
};
</script>
