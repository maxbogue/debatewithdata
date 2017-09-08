<template>
<div class="point">
  <div class="t2 bubble flex-row" :class="[side === 0 ? 'purple' : 'amber']">
    <div class="content">
      <template v-if="claim">
        <dwd-flag v-if="flag" :flag="flag"></dwd-flag>
        <router-link v-if="point.type === 'claim'"
                     :to="claimUrl(point.claimId)"
                     class="source-text">{{ claim.text }}</router-link>
        <span v-else class="source-text">{{ claim.text }}</span>
        <ul v-if="subPoints.length > 0" class="t3">
          <dwd-sub-point v-for="[subPoint, subSide, i] in subPoints"
                         :point="subPoint"
                         :side="subSide"
                         :key="subPoint.id || subPoint.tempId">
          </dwd-sub-point>
        </ul>
      </template>
      <template v-else-if="source">
        <div class="source-text">
          <span v-if="ary">{{ ary }}&nbsp;</span>
          <router-link :to="sourceUrl(point.sourceId)">
            {{ source.text }}
          </router-link>
        </div>
        <a :href="source.url" class="source-url">{{ source.url }}</a>
      </template>
      <span v-else>error</span>
    </div>
    <div class="controls">
      <dwd-star type="point" :id="point.id"></dwd-star>
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
import DwdComments from './DwdComments.vue';
import DwdFlag from './DwdFlag.vue';
import DwdStar from './DwdStar.vue';
import DwdSubPoint from './DwdSubPoint.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    DwdComments,
    DwdFlag,
    DwdStar,
    DwdSubPoint,
  },
  props: ['point', 'side'],
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
    ary: function () {
      if (!this.source) {
        return '';
      } else if (this.source.ary === 1) {
        return '①';
      } else if (this.source.ary === 2) {
        return '②';
      } else if (this.source.ary === 3) {
        return '③';
      }
      return '';
    },
    flag: function () {
      if (this.claim) {
        return this.claim.flag;
      } else if (this.point.type === 'subclaim') {
        return this.point.flag;
      }
      return '';
    },
    subPoints: function () {
      if (!this.claim || !this.$store.state.loaded) {
        return [];
      }
      return rotateWithIndexes(this.claim.points);
    },
  },
};
</script>

<style>
.point + .point {
  margin-top: 16px;
}
.t2 {
  font-size: 16px;
}
.t2 ul {
  font-size: 12px;
  margin: 0;
  padding: 0;
}
.t2 > .controls {
  margin-left: 8px;
}
</style>
