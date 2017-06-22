<template>
<div class="t2" :class="['side-' + side]">
  <template v-if="claim">
    <router-link :to="claimUrl(point.id)" class="source-text">{{ claim.text }}</router-link>
    <ul v-if="subPoints.length > 0" class="t3">
      <dwd-sub-point v-for="[subPoint, subSide] in subPoints"
                     :point="subPoint"
                     :side="subSide"
                     :key="subPoint.id">
      </dwd-sub-point>
    </ul>
  </template>
  <template v-else-if="source">
    <router-link :to="sourceUrl(point.id)" class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
  </template>
  <span v-else>error</span>
</div>
</template>

<script>
import { map } from 'lodash';

import DwdSubPoint from './DwdSubPoint.vue';
import { rotate, zipInnerWithIndex } from './utils';

export default {
  components: {
    DwdSubPoint,
  },
  props: ['point', 'side'],
  computed: {
    claim: function () {
      if (this.point.type !== 'claim') return null;
      return this.$store.state.claims[this.point.id];
    },
    source: function () {
      if (this.point.type !== 'source') return null;
      return this.$store.state.sources[this.point.id];
    },
    subPoints: function () {
      if (!this.claim || !this.$store.state.loaded) {
        return [];
      }
      return rotate(map(this.claim.points, zipInnerWithIndex));
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
  background-color: #E1BEE7;
  border: 1px solid #9C27B0;
}
.t2.side-1 {
  background-color: #FFE082;
  border: 1px solid #FFB300;
}
.t2 + .t2 {
  margin-top: 16px;
}
.t3 {
  border-radius: 5px;
  font-size: 12px;
  margin: 8px -8px -8px -8px;
  padding: 8px;
}
.side-0 .t3 {
  background-color: #F3E5F5;
}
.side-1 .t3 {
  background-color: #FFECB3;
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
