<template>
<li :class="pointClasses">
  <div class="bubble click"
       @click="showDrawer = !showDrawer">
    <point-rev-content v-if="currId === prevId" :rev="curr" />
    <claim-rev-content v-else-if="isClaimLike" :curr="curr" :prev="prev" />
    <template v-else>
      <point-rev-content v-if="prev" :rev="prev" class="del" />
      <point-rev-content v-if="curr" :rev="curr" class="ins" />
    </template>
  </div>
  <drawer :show="showDrawer">
    <div class="info">
      <span class="id mono">{{ pointId }}</span>
    </div>
    <ul v-if="subPointRevs.length > 0" class="sub-points">
      <point-rev v-for="[[pId, subCurrId, subPrevId], subSide] in subPointRevs"
                 :pointId="pId"
                 :currId="subCurrId"
                 :prevId="subPrevId"
                 :pointRevs="pointRevs"
                 :isFor="isFor === !subSide"
                 :isSubPoint="true"
                 :key="subCurrId" />
    </ul>
  </drawer>
</li>
</template>

<script>
import partition from 'lodash/partition';

import './style/point.sass';
import ClaimRevContent from './ClaimRevContent.vue';
import Drawer from './Drawer.vue';
import PointRevContent from './PointRevContent.vue';
import { rotateWithIndexes } from './utils';

export default {
  name: 'PointRev',
  components: {
    ClaimRevContent,
    Drawer,
    PointRevContent,
  },
  props: {
    pointId: {
      type: String,
      required: true,
    },
    currId: {
      type: String,
      default: '',
    },
    prevId: {
      type: String,
      default: '',
    },
    pointRevs: {
      type: Object,
      required: true,
    },
    isFor: {
      type: Boolean,
      required: true,
    },
    isSubPoint: {
      type: Boolean,
      default: false,
    },
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
    isClaimLike: function () {
      return this.curr && this.prev
          && this.curr.type === this.prev.type
          && (this.curr.type === 'text' || this.curr.type ==='subclaim');
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

        pointRevs.push(pointIds.map((id) => [id, currPoints[id], prevPoints[id]]));
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
