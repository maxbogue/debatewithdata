<template>
<div class="point">
  <div class="t2 bubble flex-row" :class="[side === 0 ? 'purple' : 'amber']">
    <div class="content">
      <template v-if="claim">
        <dwd-flag v-if="flag" :flag="flag"></dwd-flag>
        <router-link v-if="point.type === 'claim'"
                     :to="claimUrl(point.claimId, trail)"
                     class="source-text">{{ claim.text }}</router-link>
        <span v-else class="source-text">{{ claim.text }}</span>
        <ul v-if="subPoints.length > 0" class="t3">
          <dwd-sub-point v-for="[subPoint, subSide, i] in subPoints"
                         :point="subPoint"
                         :side="subSide"
                         :trail="trail.concat(point.claimId || point.id)"
                         :key="subPoint.id">
          </dwd-sub-point>
        </ul>
      </template>
      <source-content v-else-if="point.type === 'source'"
                      :source="source"
                      :trail="trail"></source-content>
      <span v-else>error</span>
    </div>
    <div class="controls">
      <dwd-star :star="point.star" :url="'/api/point/' + point.id"></dwd-star>
      <span class="glyphicon glyphicon-comment click"
            aria-hidden="true"
            @click="showComments = !showComments"></span>
    </div>
  </div>
  <dwd-comments v-if="showComments"
                :url="'/api/point/' + point.id"></dwd-comments>
</div>
</template>

<script>
import './style/point.css';
import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import DwdStar from './DwdStar.vue';
import DwdSubPoint from './DwdSubPoint.vue';
import SourceContent from './SourceContent.vue';
import { pointMapsToLists, rotateWithIndexes } from './utils';

export default {
  components: {
    DwdComments,
    DwdFlag,
    DwdStar,
    DwdSubPoint,
    SourceContent,
  },
  props: ['point', 'side', 'trail'],
  data: () => ({
    showComments: false,
  }),
  computed: {
    claim: function () {
      if (this.point.type === 'claim') {
        return this.$store.state.claims[this.point.claimId];
      }
      if (this.point.type === 'subclaim') {
        return this.point;
      }
      return null;
    },
    source: function () {
      if (this.point.type !== 'source') {
        return null;
      }
      return this.$store.state.sources[this.point.sourceId];
    },
    flag: function () {
      if (this.claim) {
        return this.claim.flag;
      } else if (this.point.type === 'subclaim') {
        return this.point.flag;
      }
      return '';
    },
    sortedSubpoints: function () {
      if (!this.claim || !this.claim.points) {
        return [];
      }
      return pointMapsToLists(this.claim.points);
    },
    subPoints: function () {
      return rotateWithIndexes(this.sortedSubpoints);
    },
  },
};
</script>
