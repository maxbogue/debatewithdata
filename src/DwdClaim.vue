<template>
<div>
  <dwd-trail @lastIsFor="(v) => isFor = v"></dwd-trail>
  <div v-if="claim" class="row gutter-16">
    <div class="col-sm-12">
      <div class="claim" :class="isFor | toSideString">
        <claim-content class="bubble click"
                       @click.native="showDrawer = !showDrawer"
                       :claim="claim"></claim-content>
        <drawer v-if="showDrawer">
          <div class="info">
            <span class="id mono">{{ claim.id }}</span>
            <dwd-star :star="claim.star"
                      :url="'/api' + claimUrl(id)"></dwd-star>
            <router-link v-if="$store.state.user"
                         :to="claimUrl(id) + '/edit'"
                         class="glyphicon glyphicon-pencil click"
                         aria-hidden="true"></router-link>
            <span class="glyphicon glyphicon-comment click"
                  aria-hidden="true"
                  @click="showComments = !showComments"></span>
          </div>
          <dwd-comments v-if="showComments"
                        :url="'/api/claim/' + id"></dwd-comments>
        </drawer>
      </div>
    </div>
    <template v-if="$store.state.singleColumn">
      <transition-group :move-class="$style.pointsMove" tag="div">
        <div v-for="[point, side, i] in zippedPoints"
             class="col-xs-12"
             :key="point.id">
          <dwd-point :point="point"
                     :isFor="claimIsFor === !side"
                     :trail="trail.concat(id)"></dwd-point>
          </dwd-point>
        </div>
      </transition-group>
    </template>
    <template v-else>
      <transition-group tag="div"
                        v-for="(sidePoints, side) in points"
                        class="col-sm-6"
                        :move-class="$style.pointsMove"
                        :key="'side-' + side">
        <dwd-point v-for="(point, i) in sidePoints"
                   :point="point"
                   :isFor="claimIsFor === !side"
                   :trail="trail.concat(id)"
                   :key="point.id">
        </dwd-point>
      </transition-group>
    </template>
  </div>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import Drawer from './Drawer.vue';
import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import DwdLoader from './DwdLoader.vue';
import DwdPoint from './DwdPoint.vue';
import DwdStar from './DwdStar.vue';
import DwdTrail from './DwdTrail.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

export default {
  components: {
    ClaimContent,
    Drawer,
    DwdComments,
    DwdFlag,
    DwdLoader,
    DwdPoint,
    DwdStar,
    DwdTrail,
  },
  data: () => ({
    showComments: false,
    showDrawer: false,
    isFor: null,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    claimIsFor: function () {
      return this.isFor !== null ? this.isFor : true;
    },
    points: function () {
      if (!this.claim || this.claim.depth < 3) {
        return [];
      }
      return pointMapsToLists(this.claim.points);
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
    trail: function () {
      if (!this.$route.query.trail) {
        return [];
      }
      return this.$route.query.trail.split(',');
    },
  },
  methods: {
    checkLoaded: function () {
      if (!this.claim || this.claim.depth < 3) {
        this.$store.dispatch('getClaim', {
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
};
</script>

<style lang="sass" module>
.pointsMove
  transition: transform 1s
</style>
