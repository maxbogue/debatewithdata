<template>
<form class="row gutter-16" @submit.prevent="submit">
  <div class="col-xs-12">
    <div class="t1">
      <textarea autocomplete="off"
                placeholder="claim"
                v-model="text"
                v-auto-resize></textarea>
    </div>
  </div>
  <template v-if="$store.state.singleColumn">
    <div v-for="[point, side, i] in zippedPoints" class="col-xs-12">
      <dwd-edit-point :point="point"
                      :side="side"
                      :canDelete="i < points[side].length - 1"
                      :key="'point-' + side + '-' + i"
                      @update="(p) => updatePoint(side, i, p)"
                      @delete="points[side].splice(i, 1)">
      </dwd-edit-point>
    </div>
  </template>
  <template v-else>
    <div v-for="(sidePoints, side) in points" class="col-sm-6">
      <dwd-edit-point v-for="(point, i) in sidePoints"
                      :point="point"
                      :side="side"
                      :canDelete="i < sidePoints.length - 1"
                      :key="'point-' + side + '-' + i"
                      @update="(p) => updatePoint(side, i, p)"
                      @delete="sidePoints.splice(i, 1)">
      </dwd-edit-point>
    </div>
  </template>
  <div v-if="error" class="col-xs-12 center">{{ error }}</div>
  <div class="col-xs-12 center">
    <button type="submit" class="btn btn-default">Submit</button>
    <button type="button" class="btn btn-default" @click="cancel">Cancel</button>
  </div>
  <div v-if="id" class="col-xs-12 center">
    <delete-button noun="Claim" @delete="remove"></delete-button>
  </div>
</form>
</template>

<script>
import { cloneDeep, filter, map } from 'lodash';

import DeleteButton from './DeleteButton.vue';
import DwdEditPoint from './DwdEditPoint.vue';
import { rotate } from './utils';

function zipInnerWithIndexes(xs, i) {
  return map(xs, (x, j) => [x, i, j]);
}

function isValidPoint(point) {
  return (point.type === 'claim' || point.type === 'source') && point.id;
}

export default {
  components: {
    DeleteButton,
    DwdEditPoint,
  },
  data: () => ({
    error: '',
    initialized: false,
    points: [[], []],
    text: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.claimId || '';
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    zippedPoints: function () {
      return rotate(map(this.points, zipInnerWithIndexes));
    },
  },
  methods: {
    updatePoint: function (si, pi, point) {
      this.$set(this.points[si], pi, point);
      if (pi === this.points[si].length - 1) {
        this.points[si].push({});
      }
    },
    submit: function () {
      let promises = [];
      for (let si = 0; si < this.points.length; si++) {
        for (let pi = 0; pi < this.points[si].length; pi++) {
          let point = this.points[si][pi];
          if (point.type === 'newClaim') {
            let promise = this.$store.dispatch('addClaim', {
              claim: point.newClaim,
            }).then((id) => {
              this.points[si][pi] = {
                type: 'claim',
                id: id,
              };
            });
            promises.push(promise);
          } else if (point.type === 'newSource') {
            let promise = this.$store.dispatch('addSource', {
              source: point.newSource,
            }).then((id) => {
              this.points[si][pi] = {
                type: 'source',
                id: id,
              };
            });
            promises.push(promise);
          } else {
            delete point.key;
          }
        }
      }
      Promise.all(promises).then(() => {
        for (let i = 0; i < this.points.length; i++) {
          this.points[i] = filter(this.points[i], isValidPoint);
        }
        this.commit();
      });
    },
    commit: function () {
      let action = 'addClaim';
      let payload = {
        claim: {
          text: this.text,
          points: this.points,
        },
      };
      if (this.id) {
        action = 'updateClaim';
        payload.id = this.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.error = '';
        this.$router.push(this.claimUrl(id));
      }).catch((error) => {
        this.error = error;
      });
    },
    remove: function () {
      this.$store.dispatch('removeClaim', {
        id: this.id,
      }).then(() => {
        this.$router.push('/claims');
      }).catch((error) => {
        this.error = error;
      });
    },
    cancel: function () {
      this.$router.push(this.id ? this.claimUrl(this.id) : '/claims');
    },
    initialize: function () {
      if (this.initialized) return;
      if (this.id && !this.claim) return;

      if (this.claim) {
        this.text = this.claim.text;
        this.points = cloneDeep(this.claim.points);
      }
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].push({});
      }
      this.initialized = true;
    },
  },
  watch: {
    '$store.state.loaded': function (loaded) {
      if (loaded) {
        this.initialize();
      }
    },
  },
  mounted: function() {
    this.initialize();
  },
};
</script>

<style>
</style>
