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
          <dwd-star type="claim" :id="id"></dwd-star>
          <router-link v-if="$store.state.user"
                       :to="claimUrl(id) + '/edit'"
                       class="glyphicon glyphicon-pencil click"
                       aria-hidden="true"></router-link>
          <span class="glyphicon glyphicon-comment click"
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
      <div v-for="(sidePoints, side) in points"
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
import { sortBy } from 'lodash';

import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import DwdPoint from './DwdPoint.vue';
import DwdStar from './DwdStar.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    DwdComments,
    DwdFlag,
    DwdPoint,
    DwdStar,
  },
  data: () => ({
    loading: true,
    showComments: false,
  }),
  computed: {
    id: function () {
      return this.$route.params.claimId;
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    points: function () {
      if (!this.claim || !this.$store.state.loaded || this.loading) {
        return [];
      }
      let starCount = (p) => -this.$store.state.stars.point[p.id].count;
      return this.claim.points.map((sidePoints) => {
        return sortBy(sidePoints, [starCount, Math.random]);
      });
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
  },
  mounted: function () {
    this.$store.dispatch('loadClaimStars', { id: this.id }).then(() => {
      this.loading = false;
    });
  },
};
</script>
