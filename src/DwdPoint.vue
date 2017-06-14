<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <template v-if="claim">
    <div class="source-text">{{ claim.text }}</div>
    <ul v-if="subPoints.length > 0">
      <li v-for="sp in subPoints" :class="['side-' + sp.side]">
        <router-link :to="sp.url">{{ sp.text }}</router-link>
      </li>
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
import { rotate } from './utils';

export default {
  components: {
    DwdPointWrapper,
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
        let sp = this.toSubPoint(p);
        sp.side = n;
        return sp;
      };
      return rotate(map(this.claim.points, (sp, si) => map(sp, setSide(si))));
    },
  },
  methods: {
    toSubPoint: function (point) {
      let p = {};
      if (point.claim) {
        p = clone(this.$store.state.claims[point.claim]);
        p.url = '/claim/' + point.claim;
      } else if (point.source) {
        p = clone(this.$store.state.sources[point.source]);
        p.url = '/source/' + point.source;
      }
      return p;
    },
  },
};
</script>

<style>
.side-0 {
  list-style: circle;
}
.side-1 {
  list-style: square;
}
</style>
