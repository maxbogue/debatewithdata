<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <template v-if="claim">
    <div>{{ claim.text }}</div>
  </template>
  <template v-else-if="source">
    <div class="source-text">{{ source.text }}</div>
    <div class="source-url">{{ source.url }}</div>
  </template>
  <span v-else>{{ point.text }}</span>
</dwd-point-wrapper>
</template>

<script>
import DwdPointWrapper from './DwdPointWrapper.vue';

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
  },
  methods: {
  },
};
</script>

<style>
</style>
