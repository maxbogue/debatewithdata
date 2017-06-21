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
      <div v-for="[point, side] in zippedPoints" class="col-xs-12">
        <dwd-point :point="point"
                   :side="side"
                   :key="point.claim || point.source">
        </dwd-point>
      </div>
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in claim.points" class="col-sm-6">
        <dwd-point v-for="point in sidePoints"
                   :point="point"
                   :side="side"
                   :key="point.claim || point.source">
        </dwd-point>
      </div>
    </template>
  </div>
  <div v-else-if="!$store.state.loaded">Loading claims...</div>
  <div v-else>Claim not found.</div>
</div>
</template>

<script>
import { map } from 'lodash';

import DwdPoint from './DwdPoint.vue';
import { rotate, zipInnerWithIndex } from './utils';

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
      return rotate(map(this.claim.points, zipInnerWithIndex));
    },
  },
};
</script>

<style>
.edit {
  float: right;
  margin-left: 5px;
}
</style>
