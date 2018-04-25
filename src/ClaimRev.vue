<template>
<div>
  <claim-rev-block :curr="curr" :prev="prev" />
  <template v-if="$store.state.singleColumn">
    <point-rev v-for="[[pId, currP, prevP], side] in zippedPointDiffs"
               :curr="currP"
               :prev="prevP"
               :is-for="!side"
               :key="pId" />
  </template>
  <template v-else>
    <div v-for="(sidePointDiffs, side) in pointDiffs"
         class="dwd-col"
         :key="'side-' + side">
      <point-rev v-for="[pointId, currPoint, prevPoint] in sidePointDiffs"
                 :curr="currPoint"
                 :prev="prevPoint"
                 :is-for="!side"
                 :key="pointId" />
    </div>
  </template>
</div>
</template>

<script>
import ClaimRevBlock from './ClaimRevBlock.vue';
import PointRev from './PointRev.vue';
import { diffPoints, rotateWithIndexes } from './utils';

export default {
  components: {
    ClaimRevBlock,
    PointRev,
  },
  props: {
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
  },
  computed: {
    pointDiffs: function () {
      return diffPoints(this.curr, this.prev, this.$store.state);
    },
    zippedPointDiffs: function () {
      return rotateWithIndexes(this.points);
    },
  },
};
</script>
