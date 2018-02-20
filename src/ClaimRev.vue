<template>
<div>
  <claim-rev-content class="claim block" :curr="curr" :prev="prev" />
  <template v-if="$store.state.singleColumn">
    <point-rev v-for="[[pointId, currId, prevId], side] in zippedPointRevs"
               :point-id="pointId"
               :curr-id="currId"
               :prev-id="prevId"
               :point-revs="data.pointRevs"
               :is-for="!side"
               :key="currId" />
  </template>
  <template v-else>
    <div v-for="(sidePointRevs, side) in pointRevs"
         class="dwd-col"
         :key="'side-' + side">
      <point-rev v-for="[pointId, currId, prevId] in sidePointRevs"
                 :point-id="pointId"
                 :curr-id="currId"
                 :prev-id="prevId"
                 :point-revs="data.pointRevs"
                 :is-for="!side"
                 :key="currId" />
    </div>
  </template>
</div>
</template>

<script>
import partition from 'lodash/partition';

import ClaimRevContent from './ClaimRevContent.vue';
import PointRev from './PointRev.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    ClaimRevContent,
    PointRev,
  },
  props: {
    claimId: { type: String, required: true },
    revId: { type: String, required: true },
    data: { type: Object, required: true },
  },
  computed: {
    revIndex: function () {
      return this.data.claimRevs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.data.claimRevs[this.revIndex];
    },
    prev: function () {
      return this.data.claimRevs[this.revIndex + 1];
    },
    pointRevs: function () {
      let pointRevs = [];
      let hasCurrPoints = this.curr && this.curr.points;
      let hasPrevPoints = this.prev && this.prev.points;
      for (let i of [0, 1]) {
        let currPoints = hasCurrPoints ? this.curr.points[i] : {};
        let prevPoints = hasPrevPoints ? this.prev.points[i] : {};

        let inPrev = (id) => prevPoints[id];
        let isModified = (id) => currPoints[id] !== prevPoints[id];

        let [inBoth, added] = partition(Object.keys(currPoints), inPrev);
        let removed = Object.keys(prevPoints).filter((id) => !currPoints[id]);
        let [modified, unmodified] = partition(inBoth, isModified);

        added.sort();
        removed.sort();
        modified.sort();
        unmodified.sort();

        let pointIds = added.concat(removed, modified, unmodified);
        let pointIdToRevs = (id) => [id, currPoints[id], prevPoints[id]];
        pointRevs.push(pointIds.map(pointIdToRevs));
      }
      return pointRevs;
    },
    zippedPointRevs: function () {
      return rotateWithIndexes(this.points);
    },
  },
};
</script>
