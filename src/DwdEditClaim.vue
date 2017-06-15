<template>
<form class="row gutter-16" @submit.prevent="commit">
  <div class="col-sm-12">
    <div class="claim">
      <input type="text"
                autocomplete="off"
                placeholder="claim"
                v-model="text"></input>
    </div>
  </div>
  <template v-if="$store.state.singleColumn">
    <div v-for="[point, side] in zippedPoints" class="col-xs-12">
      <dwd-edit-point :point="point"
                      :side="side"
                      :key="point.claim || point.source">
      </dwd-edit-point>
    </div>
  </template>
  <template v-else>
    <div v-for="(sidePoints, side) in points" class="col-sm-6">
      <dwd-edit-point v-for="point in sidePoints"
                      :point="point"
                      :side="side"
                      :key="point.claim || point.source">
      </dwd-edit-point>
    </div>
  </template>
  <div v-for="(items, side) in points" class="col-sm-6">
    <button type="button" :disabled="!canAddPoint(side)" class="btn btn-default" @click="addPoint(side)">
      Add point {{ sideString(side) }}
    </button>
  </div>
  <div class="col-sm-12">
    <button type="submit" class="btn btn-default">
      Submit
    </button>
    <button type="button" class="btn btn-default" @click="cancel">
      Cancel
    </button>
  </div>
</form>
</template>

<script>
import { cloneDeep, map } from 'lodash';

import DwdEditPoint from './DwdEditPoint.vue';
import { rotate, zipInnerWithIndex } from './utils';

export default {
  components: {
    DwdEditPoint,
  },
  props: ['claim'],
  data: () => ({
    text: '',
    points: [[], []],
  }),
  computed: {
    zippedPoints: function () {
      return rotate(map(this.points, zipInnerWithIndex));
    },
  },
  methods: {
    canAddPoint: function (si) {
      let n = this.points[si].length;
      if (n === 0) return true;
      let p = this.points[si][n - 1];
      return p.claim || p.source || p.text;
    },
    commit: function () {
      let promises = [];
      for (let si = 0; si < this.points.length; si++) {
        for (let pi = 0; pi < this.points[si].length; pi++) {
          let point = this.points[si][pi];
          console.log(point);
          if (point.newClaim) {
            let promise = this.$store.dispatch('addClaim', {
              claim: point.newClaim,
            }).then((id) => {
              this.points[si][pi] = { claim: id };
            });
            promises.push(promise);
          } else if (point.newSource) {
            let promise = this.$store.dispatch('addSource', {
              source: point.newSource,
            }).then((id) => {
              this.points[si][pi] = { source: id };
            });
            promises.push(promise);
          }
        }
      }
      Promise.all(promises).then(() => {
        this.$emit('commit', {
          text: this.text,
          points: this.points,
        });
      });
    },
    cancel: function () {
      this.reset();
      this.$emit('cancel');
    },
    reset: function () {
      if (this.claim) {
        this.text = this.claim.text;
        this.points = cloneDeep(this.claim.points);
      }
    },
    addPoint: function (i) {
      this.points[i].push({
        text: '',
      });
      this.points[1-i].push({});
      this.points[1-i].pop();
    },
    deletePoint: function (si, pi) {
      this.points[si].splice(pi, 1);
    },
    sideString: function (i) {
      return ['for', 'against'][i];
    },
  },
  mounted: function() {
    this.reset();
  },
};
</script>

<style>
</style>
