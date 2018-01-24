<template>
<li :class="pointClasses">
  <point-content class="bubble click"
                 @click.native="showDrawer = !showDrawer"
                 :point="point"
                 :trail="trail"></point-content>
  <drawer :show="showDrawer">
    <div class="info">
      <span class="id mono">{{ point.id }}</span>
      <dwd-star :star="point.star" :url="'/api/point/' + point.id"></dwd-star>
      <comment-icon @click.native="showComments = !showComments"
                    :count="point.commentCount"></comment-icon>
    </div>
    <dwd-comments v-if="showComments"
                  :url="'/api/point/' + point.id"></dwd-comments>
    <transition-group tag="ul"
                      v-if="subPoints.length > 0"
                      class="sub-points"
                      :move-class="$style.subPointsMove">
      <dwd-point v-for="[subPoint, subSide, i] in subPoints"
                 :point="subPoint"
                 :isFor="isFor === !subSide"
                 :isSubPoint="true"
                 :trail="trail.concat(point.claimId || point.id)"
                 :key="subPoint.id"></dwd-point>
    </transition-group>
  </drawer>
</li>
</template>

<script>
import './style/point.sass';
import CommentIcon from './CommentIcon.vue';
import Drawer from './Drawer.vue';
import DwdComments from './DwdComments.vue';
import DwdStar from './DwdStar.vue';
import PointContent from './PointContent.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

export default {
  name: 'DwdPoint',
  components: {
    CommentIcon,
    Drawer,
    DwdComments,
    DwdStar,
    PointContent,
  },
  props: {
    point: {
      type: Object,
      required: true,
    },
    isFor: {
      type: Boolean,
      required: true,
    },
    trail: {
      type: Array,
      required: false,
    },
    isSubPoint: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    showComments: false,
    showDrawer: false,
  }),
  computed: {
    pointClasses: function () {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
    sortedSubpoints: function () {
      if (this.isSubPoint) {
        return [];
      }
      if (this.point.type === 'subclaim') {
        return pointMapsToLists(this.point.points);
      } else if (this.point.type === 'claim') {
        let claim = this.lookupClaim(this.point.claimId);
        return claim.deleted ? [] : pointMapsToLists(claim.points);
      }
      return [];
    },
    subPoints: function () {
      return rotateWithIndexes(this.sortedSubpoints);
    },
  },
};
</script>

<style lang="sass" module>
.subPointsMove
  transition: transform 1s
</style>
