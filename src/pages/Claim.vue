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
          <icon-star :star="claim.star" :url="'/api' + claimUrl(id)" />
          <icon-history :url="claimUrl(id)" />
          <icon-edit v-if="$store.state.user" :url="claimUrl(id)" />
          <icon-comment @click.native="showComments = !showComments"
                        :count="claim.commentCount" />
        </div>
        <dwd-comments :url="'/api/claim/' + id"
                      :show="showComments"
                      :hint="showDrawer" />
      </drawer>
    </div>
    <template v-if="$store.state.singleColumn">
      <transition-group tag="div" :move-class="$style.pointsMove">
        <point-block v-for="[point, side] in zippedPoints"
                     :point="point"
                     :is-for="claimIsFor === !side"
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
        <point-block v-for="point in sidePoints"
                     :point="point"
                     :is-for="claimIsFor === !side"
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
import Drawer from '../Drawer.vue';
import DwdComments from '../DwdComments.vue';
import DwdFlag from '../DwdFlag.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import IconComment from '../IconComment.vue';
import IconEdit from '../IconEdit.vue';
import IconHistory from '../IconHistory.vue';
import IconStar from '../IconStar.vue';
import PointBlock from '../PointBlock.vue';
import { pointMapsToLists, rotateWithIndexes } from '../utils';

export default {
  components: {
    ClaimContent,
    Drawer,
    DwdComments,
    DwdFlag,
    DwdLoader,
    DwdTrail,
    IconComment,
    IconEdit,
    IconHistory,
    IconStar,
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
