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
  <template v-for="pi in pointIndexes">
    <dwd-edit-point v-for="si in sideIndexes"
                    :points="points"
                    :sideIndex="si"
                    :pointIndex="pi"
                    :key="'editPoint-' + si + '-' + pi"
                    @delete="deletePoint(si, pi)">
    </dwd-edit-point>
    <div class="clearfix"></div>
  </template>
  <div v-for="si in sideIndexes" class="col-sm-6">
    <button type="button" :disabled="!canAddPoint(si)" class="btn btn-default" @click="addPoint(si)">
      Add point {{ sideString(si) }}
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
import clone from 'clone';
import { range } from 'lodash';

import DwdEditPoint from './DwdEditPoint.vue';

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
    pointIndexes: function () {
      return range(this.points.reduce((acc, pts) => Math.max(acc, pts.length), 0));
    },
    sideIndexes: function () {
      return range(this.points.length);
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
        this.points = clone(this.claim.points);
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
