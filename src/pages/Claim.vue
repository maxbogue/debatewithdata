<template>
<div>
  <dwd-trail :ids="trail" @lastIsFor="(v) => isFor = v" />
  <template v-if="claim">
    <div class="claim" :class="isFor | toSideString">
      <claim-content class="bubble" :claim="claim" />
      <div class="info">
        <span class="id mono">{{ claim.id }}</span>
        <icon-star :star="claim.star" :url="'/api' + claimUrl(id)" />
        <icon-history :url="claimUrl(id)" />
        <icon-edit v-if="$store.state.user" :url="claimUrl(id)" />
        <icon-comment @click.native="showComments = !showComments"
                      :count="claim.commentCount" />
      </div>
      <dwd-comments :url="'/api/claim/' + id"
                    :show="showComments" />
    </div>
    <template v-if="$store.state.singleColumn">
      <transition-group tag="div" :move-class="$style.pointsMove">
        <div v-if="zippedPoints.length > 0"
             class="block no-pad"
             :class="$style.pointHeader"
             key="side-text">
          <span :class="claimIsFor ? $style.for : $style.against"
                >For</span>
          <span> // </span>
          <span :class="claimIsFor ? $style.against : $style.for"
                >Against</span>
        </div>
        <point-block v-for="[point, side] in zippedPoints"
                     :point="point"
                     :is-for="claimIsFor === !side"
                     :trail="trail"
                     :key="point.id" />
      </transition-group>
    </template>
    <template v-else>
      <transition-group tag="div"
                        v-for="(sidePoints, side) in points"
                        class="dwd-col"
                        :move-class="$style.pointsMove"
                        :key="'side-' + side">
        <div v-if="sidePoints.length > 0"
             class="block no-pad"
             :class="$style.pointHeader"
             :key="'side-text-' + side">
          <span :class="claimIsFor === !side ? $style.for : $style.against"
                >{{ !side ? 'For' : 'Against' }}</span>
        </div>
        <point-block v-for="point in sidePoints"
                     :point="point"
                     :is-for="claimIsFor === !side"
                     :trail="trail"
                     :key="point.id" />
      </transition-group>
    </template>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import ClaimContent from '../ClaimContent.vue';
import DwdComments from '../DwdComments.vue';
import DwdDrawer from '../DwdDrawer.vue';
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
    DwdComments,
    DwdDrawer,
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
      if (!this.claim || this.claim.deleted || this.claim.depth < 2) {
        return [];
      }
      return pointMapsToLists(this.claim.points);
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail).concat(this.id);
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
  methods: {
    checkLoaded: function () {
      let claim = this.claim;
      if (!claim || claim.depth < 3) {
        this.$store.dispatch('getClaim', {
          id: this.id,
          trail: this.parseTrail(this.$route.query.trail),
          loader: !claim || claim.depth < 2 ? this.$refs.loader : null,
        });
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.pointsMove {
  transition: transform 1s;
}

.pointHeader {
  display: flex;
  font-size: 1.25em;
  text-align: center;

  &:global(.block) > span {
    margin-top: 0;
  }

  .for {
    flex: 1;
    color: $purple-dark-primary;
  }

  .against {
    flex: 1;
    color: $amber-dark-primary;
  }
}
</style>
