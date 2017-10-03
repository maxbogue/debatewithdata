<template>
<div>
  <div v-if="claim" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1 bubble blue flex-row">
        <div class="content">
          <div>{{ claim.text }}</div>
          <dwd-flag v-if="claim.flag" :flag="claim.flag"></dwd-flag>
        </div>
        <div class="controls">
          <dwd-star :star="claim.star" :url="'/api' + claimUrl(id)"></dwd-star>
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
           :key="point.id">
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
                   :key="point.id">
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
import DwdStar from './DwdStar.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

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
      return pointMapsToLists(this.claim.points);
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
  },
  methods: {
    checkLoaded: function () {
      if (!this.claim || this.claim.depth < 3) {
        this.loading = true;
        this.$store.dispatch('getClaim', { id: this.id }).then(() => {
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
};
</script>
