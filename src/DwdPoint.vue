<template>
<div class="col-sm-6"
     :class="{'col-sm-offset-6': needsOffset}">
  <div class="point" :class="[sideIndex > 0 ? 'against' : 'for']">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  props: ['points', 'sideIndex', 'pointIndex'],
  data: () => ({
  }),
  computed: {
    needsOffset: function () {
      let si = this.sideIndex;
      let pi = this.pointIndex;
      return si > 0 && !this.points[si - 1][pi];
    },
  },
  methods: {
  },
};
</script>

<style>
.point {
  padding: 15px;
  position: relative;
}
.for {
  background-color: #80DEEA;
  border: 1px solid #00ACC1;
}
.against {
  background-color: #FFE082;
  border: 1px solid #FFB300;
}
</style>
