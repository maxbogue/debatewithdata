<template>
<div>
  <div v-if="claim" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1 flex-row">
        <div class="content">
          <div>{{ claim.text }}</div>
          <dwd-flag v-if="claim.flag" :flag="claim.flag"></dwd-flag>
        </div>
        <div class="controls">
          <router-link :to="claimUrl(id) + '/edit'"
                       class="glyphicon glyphicon-pencil"
                       aria-hidden="true"></router-link>
          <span class="glyphicon glyphicon-comment"
                aria-hidden="true"
                @click="showComments = !showComments"></span>
        </div>
      </div>
      <dwd-comments v-if="showComments"
                    :url="'/api/claim/' + id"></dwd-comments>
    </div>
    <template v-if="$store.state.singleColumn">
      <div v-for="[point, side, i] in zippedPoints"
           class="col-xs-12"
           :key="point.id || point.tempId">
        <dwd-point :point="point"
           :side="side"></dwd-point>
        </dwd-point>
      </div>
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in claim.points"
           class="col-sm-6"
           :key="'side-' + side">
        <dwd-point v-for="(point, i) in sidePoints"
                   :point="point"
                   :side="side"
                   :key="point.id || point.tempId">
        </dwd-point>
      </div>
    </template>
  </div>
  <div v-else-if="!$store.state.loaded">Loading claims...</div>
  <div v-else>Claim not found.</div>
</div>
</template>

<script>
import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import DwdPoint from './DwdPoint.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    DwdComments,
    DwdFlag,
    DwdPoint,
  },
  data: () => ({
    showComments: false,
  }),
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
