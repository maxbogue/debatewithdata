<template>
<div>
  <claim-rev-content class="claim block" :curr="curr" :prev="prev" />
  <template v-if="$store.state.singleColumn">
    <point-rev v-for="[[pId, currP, prevP], side] in zippedPointRevs"
               :curr="currP"
               :prev="prevP"
               :is-for="!side"
               :key="pId" />
  </template>
  <template v-else>
    <div v-for="(sidePointRevs, side) in pointRevs"
         class="dwd-col"
         :key="'side-' + side">
      <point-rev v-for="[pointId, currPoint, prevPoint] in sidePointRevs"
                 :curr="currPoint"
                 :prev="prevPoint"
                 :is-for="!side"
                 :key="pointId" />
    </div>
  </template>
</div>
</template>

<script>
import ClaimRevContent from './ClaimRevContent.vue';
import PointRev from './PointRev.vue';
import { diffPointRevs, rotateWithIndexes } from './utils';

export default {
  components: {
    ClaimRevContent,
    PointRev,
  },
  props: {
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
  },
  computed: {
    pointRevs: function () {
      return diffPointRevs(this.curr, this.prev);
    },
    zippedPointRevs: function () {
      return rotateWithIndexes(this.points);
    },
  },
};
</script>
