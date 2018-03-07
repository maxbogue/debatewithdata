<template>
<li :class="pointClasses">
  <point-content class="bubble click"
                 @click.native="showDrawer = !showDrawer"
                 :point="point"
                 :trail="trail" />
  <dwd-drawer :show="showDrawer">
    <div class="info">
      <span class="id mono">{{ point.id }}</span>
      <icon-star :star="point.star" :url="'/api/point/' + point.id" />
      <icon-history :url="'/point/' + point.id" />
      <icon-comment @click.native="showComments = !showComments"
                    :count="point.commentCount" />
    </div>
    <dwd-comments :url="'/api/point/' + point.id"
                  :show="showComments"
                  :hint="showDrawer" />
    <transition-group tag="div"
                      v-if="subPoints.length > 0"
                      :move-class="$style.subPointsMove">
      <point-block v-for="[subPoint, subSide] in subPoints"
                   :point="subPoint"
                   :is-for="isFor === !subSide"
                   :is-sub-point="true"
                   :trail="trail.concat(point.claimId || point.id)"
                   :key="subPoint.id" />
    </transition-group>
  </dwd-drawer>
</li>
</template>

<script>
import './style/point.scss';
import DwdComments from './DwdComments.vue';
import DwdDrawer from './DwdDrawer.vue';
import IconComment from './IconComment.vue';
import IconHistory from './IconHistory.vue';
import IconStar from './IconStar.vue';
import PointContent from './PointContent.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

export default {
  name: 'PointBlock',
  components: {
    DwdComments,
    DwdDrawer,
    IconComment,
    IconHistory,
    IconStar,
    PointContent,
  },
  props: {
    point: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
    trail: { type: Array, default: null },
    isSubPoint: { type: Boolean, default: false },
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

<style lang="scss" module>
.subPointsMove {
  transition: transform 1s;
}
</style>
