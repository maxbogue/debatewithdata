<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <template v-if="claim">
    <router-link :to="'/claim/' + point.claim" class="source-text">{{ claim.text }}</router-link>
    <ul v-if="subPoints.length > 0" class="t3">
      <dwd-sub-point v-for="item in subPoints"
                     :item="item"
                     :key="item.claim || item.source">
      </dwd-sub-point>
    </ul>
  </template>
  <template v-else-if="source">
    <router-link :to="'/source/' + point.source" class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
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
  padding: 0;
}
.t3 li {
  list-style: none;
  padding: 0;
}
.t3 li:before {
  font-family: "Courier New";
  font-size: 12px;
  font-weight: 600;
  padding-right: 5px;
}
.t3 li.side-0:before {
  content: "+";
}
.t3 li.side-1:before {
  content: "-";
}
</style>
