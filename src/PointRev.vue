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
    <ul v-if="subPointRevs.length > 0" class="sub-points">
      <point-rev v-for="[[pId, subCurrId, subPrevId], subSide] in subPointRevs"
                 :point-id="pId"
                 :curr-id="subCurrId"
                 :prev-id="subPrevId"
                 :point-revs="pointRevs"
                 :is-for="isFor === !subSide"
                 :is-sub-point="true"
                 :key="subCurrId" />
    </ul>
  </dwd-drawer>
</li>
</template>

<script>
import partition from 'lodash/partition';

import './style/point.sass';
import DwdDrawer from './DwdDrawer.vue';
import PointDiff from './PointDiff.vue';
import { rotateWithIndexes } from './utils';

export default {
  name: 'PointRev',
  components: {
    DwdDrawer,
    PointDiff,
  },
  props: {
    pointId: { type: String, required: true, },
    currId: { type: String, default: '' },
    prevId: { type: String, default: '' },
    pointRevs: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
    isSubPoint: { type: Boolean, default: false },
  },
  data: () => ({
    showDrawer: false,
  }),
  computed: {
    curr: function () {
      return this.pointRevs[this.currId] || null;
    },
    prev: function () {
      return this.pointRevs[this.prevId] || null;
    },
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

      let currHasPoints = this.curr && this.curr.points;
      let prevHasPoints = this.prev && this.prev.points;
      let pointRevs = [];

      for (let i of [0, 1]) {
        let currPoints = currHasPoints ? this.curr.points[i] : {};
        let prevPoints = prevHasPoints ? this.prev.points[i] : {};

        let inPrev = (id) => prevPoints[id];
        let notInCurr = (id) => !currPoints[id];
        let isModified = (id) => currPoints[id] === prevPoints[id];

        let [inBoth, added] = partition(Object.keys(currPoints), inPrev);
        let removed = Object.keys(prevPoints).filter(notInCurr);
        let [modified, unmodified] = partition(inBoth, isModified);

        added.sort();
        removed.sort();
        modified.sort();
        unmodified.sort();

        let pointIds = added.concat(removed, modified, unmodified);
        let pointIdToRevs = (id) => [id, currPoints[id], prevPoints[id]];
        pointRevs.push(pointIds.map(pointIdToRevs));
      }
      return rotateWithIndexes(pointRevs);
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
  mounted: function () {
    this.showDrawer = this.hasChangedSubPoints;
  },
};
</script>
