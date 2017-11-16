<template>
<div class="point" :class="isFor | toSideString">
  <div class="bubble click" @click="showDrawer = !showDrawer">
    <point-content class="content"
                   :point="point"
                   :trail="trail"></point-content>
  </div>
  <drawer v-if="showDrawer">
    <div class="info">
      <dwd-star :star="point.star" :url="'/api/point/' + point.id"></dwd-star>
      <span class="glyphicon glyphicon-comment click"
            aria-hidden="true"
            @click="showComments = !showComments"></span>
    </div>
    <dwd-comments v-if="showComments"
                  :url="'/api/point/' + point.id"></dwd-comments>
    <ul v-if="subPoints.length > 0" class="subpoints">
      <dwd-sub-point v-for="[subPoint, subSide, i] in subPoints"
                     :point="subPoint"
                     :isFor="isFor === !subSide"
                     :trail="trail.concat(point.claimId || point.id)"
                     :key="subPoint.id">
      </dwd-sub-point>
    </ul>
  </drawer>
</div>
</template>

<script>
import './style/point.sass';
import Drawer from './Drawer.vue';
import DwdComments from './DwdComments.vue';
import DwdStar from './DwdStar.vue';
import DwdSubPoint from './DwdSubPoint.vue';
import PointContent from './PointContent.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

export default {
  components: {
    Drawer,
    DwdComments,
    DwdStar,
    DwdSubPoint,
    PointContent,
  },
  props: ['point', 'isFor', 'trail'],
  data: () => ({
    showComments: false,
    showDrawer: false,
  }),
  computed: {
    sortedSubpoints: function () {
      if (this.point.type === 'subclaim') {
        return pointMapsToLists(this.point.points);
      } else if (this.point.type === 'claim') {
        let claim = this.$store.state.claims[this.point.claimId];
        return pointMapsToLists(claim.points);
      }
      return [];
    },
    subPoints: function () {
      return rotateWithIndexes(this.sortedSubpoints);
    },
  },
};
</script>
