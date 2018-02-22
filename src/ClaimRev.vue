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
import ClaimRevContent from './ClaimRevContent.vue';
import PointRev from './PointRev.vue';
import { diffPointRevs, rotateWithIndexes } from './utils';

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
      return diffPointRevs(this.curr, this.prev);
    },
    zippedPointRevs: function () {
      return rotateWithIndexes(this.points);
    },
  },
};
</script>
