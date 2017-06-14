<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <template v-if="claim">
    <div class="source-text">{{ claim.text }}</div>
    <ul v-if="subPoints.length > 0" class="t3">
      <dwd-sub-point v-for="item in subPoints"
                     :item="item"
                     :key="item.claim || item.source">
      </dwd-sub-point>
    </ul>
  </template>
  <template v-else-if="source">
    <div class="source-text">{{ source.text }}</div>
    <div class="source-url">{{ source.url }}</div>
  </template>
  <span v-else>{{ point.text }}</span>
</dwd-point-wrapper>
</template>

<script>
import { clone, map } from 'lodash';

import DwdPointWrapper from './DwdPointWrapper.vue';
import DwdSubPoint from './DwdSubPoint.vue';
import { rotate } from './utils';

export default {
  components: {
    DwdPointWrapper,
    DwdSubPoint,
  },
  props: ['points', 'sideIndex', 'pointIndex'],
  computed: {
    point: function () {
      return this.points[this.sideIndex][this.pointIndex];
    },
    claim: function () {
      return this.$store.state.claims[this.point.claim];
    },
    source: function () {
      return this.$store.state.sources[this.point.source];
    },
    subPoints: function () {
      if (!this.claim || !this.$store.state.loaded) {
        return [];
      }
      let setSide = (n) => (p) => {
        let item = clone(p);
        item.side = n;
        return item;
      };
      return rotate(map(this.claim.points, (sp, si) => map(sp, setSide(si))));
    },
  },
};
</script>

<style>
.t3 {
  margin: 5px 0 0 0;
  padding-left: 16px;
}
.t3 li {
  padding: 0;
}
</style>
