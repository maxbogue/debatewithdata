<template>
  <div>
    <claim-rev-block :curr="curr" :prev="prev" />
    <template v-if="$store.state.singleColumn">
      <point-rev
        v-for="[[pId, currP, prevP], side] in zippedPointDiffs"
        :key="pId"
        :curr="currP"
        :prev="prevP"
        :is-for="!side"
        :trail="trail"
      />
    </template>
    <div v-else class="dwd-cols">
      <div
        v-for="(sidePointDiffs, side) in pointDiffs"
        class="dwd-col"
        :key="'side-' + side"
      >
        <point-rev
          v-for="[pointId, currPoint, prevPoint] in sidePointDiffs"
          :key="pointId"
          :curr="currPoint"
          :prev="prevPoint"
          :is-for="!side"
          :trail="trail"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { diffPoints, rotateWithIndexes } from '@/utils';

import ClaimRevBlock from './ClaimRevBlock.vue';
import PointRev from './PointRev.vue';

export default {
  components: {
    ClaimRevBlock,
    PointRev,
  },
  props: {
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
    trail: { type: Array, required: true },
  },
  computed: {
    pointDiffs() {
      return diffPoints(this.curr, this.prev, this.$store.state);
    },
    zippedPointDiffs() {
      return rotateWithIndexes(this.points);
    },
  },
};
</script>
