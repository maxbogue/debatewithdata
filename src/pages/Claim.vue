<template>
<div>
  <dwd-trail @lastIsFor="(v) => isFor = v" />
  <template v-if="claim">
    <div class="claim" :class="isFor | toSideString">
      <claim-content class="bubble click"
                     @click.native="showDrawer = !showDrawer"
                     :claim="claim" />
      <drawer :show="showDrawer">
        <div class="info">
          <span class="id mono">{{ claim.id }}</span>
          <dwd-star :star="claim.star"
                    :url="'/api' + claimUrl(id)" />
          <router-link :to="claimUrl(id) + '/history'"
                       class="glyphicon glyphicon-time click"
                       aria-hidden="true"></router-link>
          <router-link v-if="$store.state.user"
                       :to="claimUrl(id) + '/edit'"
                       class="glyphicon glyphicon-pencil click"
                       aria-hidden="true"></router-link>
          <comment-icon @click.native="showComments = !showComments"
                        :count="claim.commentCount" />
        </div>
        <dwd-comments :url="'/api/claim/' + id"
                      :show="showComments"
                      :hint="showDrawer" />
      </drawer>
    </div>
    <template v-if="$store.state.singleColumn">
      <transition-group tag="div" :move-class="$style.pointsMove">
        <point-block v-for="[point, side, i] in zippedPoints"
                     :point="point"
                     :isFor="claimIsFor === !side"
                     :trail="trail.concat(id)"
                     :key="point.id" />
      </transition-group>
    </template>
    <template v-else>
      <transition-group tag="div"
                        v-for="(sidePoints, side) in points"
                        class="dwd-col"
                        :move-class="$style.pointsMove"
                        :key="'side-' + side">
        <point-block v-for="(point, i) in sidePoints"
                     :point="point"
                     :isFor="claimIsFor === !side"
                     :trail="trail.concat(id)"
                     :key="point.id" />
      </transition-group>
    </template>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import ClaimContent from '../ClaimContent.vue';
import CommentIcon from '../CommentIcon.vue';
import Drawer from '../Drawer.vue';
import DwdComments from '../DwdComments.vue';
import DwdFlag from '../DwdFlag.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdStar from '../DwdStar.vue';
import DwdTrail from '../DwdTrail.vue';
import PointBlock from '../PointBlock.vue';
import { pointMapsToLists, rotateWithIndexes } from '../utils';

export default {
  components: {
    ClaimContent,
    CommentIcon,
    Drawer,
    DwdComments,
    DwdFlag,
    DwdLoader,
    DwdStar,
    DwdTrail,
    PointBlock,
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
      if (!this.claim || this.claim.deleted || this.claim.depth < 3) {
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
