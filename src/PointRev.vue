<template>
<li :class="pointClasses">
  <div class="bubble">
    <point-rev-content v-if="currId === prevId" :rev="curr" />
    <claim-rev-content v-else-if="isClaimLike" :curr="curr" :prev="prev" />
    <template v-else>
      <del v-if="prev"><point-rev-content :rev="prev" /></del>
      <ins v-if="curr"><point-rev-content :rev="curr" /></ins>
    </template>
  </div>
  <div>
    <ul v-if="subPointRevs.length > 0" class="sub-points">
      <point-rev v-for="[[subCurrId, subPrevId], subSide] in subPointRevs"
                 :currId="subCurrId"
                 :prevId="subPrevId"
                 :pointRevs="pointRevs"
                 :isFor="isFor === !subSide"
                 :isSubPoint="true"
                 :key="subCurrId" />
    </ul>
  </div>
</li>
</template>

<script>
import partition from 'lodash/partition';

import './style/point.sass';
import ClaimRevContent from './ClaimRevContent.vue';
import PointRevContent from './PointRevContent.vue';
import { rotateWithIndexes } from './utils';

export default {
  name: 'PointRev',
  components: {
    ClaimRevContent,
    PointRevContent,
  },
  props: {
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
  computed: {
    curr: function () {
      return this.pointRevs[this.currId] || null;
    },
    prev: function () {
      return this.pointRevs[this.prevId] || null;
    },
    hasSubClaims: function () {
      return this.curr && this.curr.type === 'subclaim'
          || this.prev && this.prev.type === 'subclaim';
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
      if (this.isSubPoint || !this.hasSubClaims) {
        return [];
      }

      let pointRevs = [];
      for (let i of [0, 1]) {
        let currPoints = this.curr ? this.curr.points[i] : {};
        let prevPoints = this.prev ? this.prev.points[i] : {};

        let inPrev = (id) => prevPoints[id];
        let isModified = (id) => currPoints[id] === prevPoints[id];

        let [inBoth, added] = partition(Object.keys(currPoints), inPrev);
        let removed = Object.keys(prevPoints).filter((id) => !currPoints[id]);
        let [modified, unmodified] = partition(inBoth, isModified);

        added.sort();
        removed.sort();
        modified.sort();
        unmodified.sort();
        let pointIds = added.concat(removed, modified, unmodified);

        pointRevs.push(pointIds.map((id) => [currPoints[id], prevPoints[id]]));
      }
      return rotateWithIndexes(pointRevs);
    },
  },
};
</script>
