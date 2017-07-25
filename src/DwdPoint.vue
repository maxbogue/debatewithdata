<template>
<div class="point">
  <div class="t2 flex-row" :class="['side-' + side]">
    <div class="content">
      <template v-if="claim">
        <dwd-flag v-if="flag" :flag="flag"></dwd-flag>
        <router-link v-if="point.type === 'claim'"
                     :to="claimUrl(point.id)"
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
        <router-link :to="sourceUrl(point.id)"
                     class="source-text">{{ source.text }}</router-link>
        <a :href="source.url" class="source-url">{{ source.url }}</a>
      </template>
      <span v-else>error</span>
    </div>
    <div class="controls">
      <span class="glyphicon glyphicon-comment"
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
import DwdSubPoint from './DwdSubPoint.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    DwdComments,
    DwdFlag,
    DwdSubPoint,
  },
  props: ['point', 'side'],
  data: () => ({
    showComments: false,
  }),
  computed: {
    claim: function () {
      if (this.point.type === 'claim') {
        return this.$store.state.claims[this.point.id];
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
      return this.$store.state.sources[this.point.id];
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
.t2 {
  border-radius: 5px;
  font-size: 16px;
  padding: 16px;
  position: relative;
}
.t2.side-0 {
  background-color: #F3E5F5;
  border: 1px solid #E1BEE7;
}
.t2.side-1 {
  background-color: #FFF8E1;
  border: 1px solid #FFE082;
}
.point + .point {
  margin-top: 16px;
}
.t3 {
  border-radius: 5px;
  font-size: 12px;
  margin: 0;
  padding: 0;
}
.t3 > li {
  list-style: none;
  margin-top: 8px;
  padding: 0;
}
.t3 li:before {
  color: rgba(0, 0, 0, 0.65);
  font-family: 'Glyphicons Halflings';
  margin-right: 4px;
}
.t3 li.side-0:before {
  content: "\e081";
}
.t3 li.side-1:before {
  content: "\e082";
}
</style>
