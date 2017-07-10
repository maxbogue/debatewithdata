<template>
<div>
  <div v-if="claim" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1">
        <router-link :to="claimUrl(id) + '/edit'" class="glyphicon glyphicon-pencil edit click" aria-hidden="true"></router-link>
        <div>{{ claim.text }}</div>
      </div>
    </div>
    <template v-if="$store.state.singleColumn">
      <div v-for="[point, side, i] in zippedPoints" class="col-xs-12">
        <dwd-point :point="point"
                   :side="side"
                   :key="'point-' + side + '-' + i">
        </dwd-point>
      </div>
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in claim.points" class="col-sm-6">
        <dwd-point v-for="(point, i) in sidePoints"
                   :point="point"
                   :side="side"
                   :key="'point-' + side + '-' + i">
        </dwd-point>
      </div>
    </template>
  </div>
  <div v-else-if="!$store.state.loaded">Loading claims...</div>
  <div v-else>Claim not found.</div>
</div>
</template>

<script>
import DwdPoint from './DwdPoint.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    DwdPoint,
  },
  computed: {
    id: function () {
      return this.$route.params.claimId;
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    zippedPoints: function () {
      if (!this.claim || !this.$store.state.loaded) {
        return [];
      }
      return rotateWithIndexes(this.claim.points);
    },
  },
};
</script>

<style>
.edit {
  float: right;
  margin-left: 4px;
}
</style>
