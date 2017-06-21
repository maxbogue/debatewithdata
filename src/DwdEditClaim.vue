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
                      :isLast="i === points[side].length - 1"
                      :key="getKey(point)"
                      @delete="points[side].splice(i, 1)"
                      @makeNewEmpty="points[side].push({})">
      </dwd-edit-point>
    </div>
  </template>
  <template v-else>
    <div v-for="(sidePoints, side) in points" class="col-sm-6">
      <dwd-edit-point v-for="(point, i) in sidePoints"
                      :point="point"
                      :side="side"
                      :isLast="i === sidePoints.length - 1"
                      :key="getKey(point)"
                      @delete="sidePoints.splice(i, 1)"
                      @makeNewEmpty="sidePoints.push({})">
      </dwd-edit-point>
    </div>
  </template>
  <div v-if="error" class="col-xs-12 center">{{ error }}</div>
  <div class="col-xs-12 center">
    <button type="submit" class="btn btn-default">Submit</button>
    <button type="button" class="btn btn-default" @click="cancel">Cancel</button>
  </div>
  <div v-if="id" class="col-xs-12 center">
    <button v-if="!confirmRemove" type="button" class="btn btn-danger" @click="startRemove">Delete Claim</button>
    <button v-else type="button" class="btn btn-danger" @click="reallyRemove">Really Delete?</button>
  </div>
</form>
</template>

<script>
import { cloneDeep, filter, map } from 'lodash';

import DwdEditPoint from './DwdEditPoint.vue';
import { rotate } from './utils';

function zipInnerWithIndexes(xs, i) {
  return map(xs, (x, j) => [x, i, j]);
}

function isValidPoint(point) {
  return point.claim || point.source;
}

export default {
  components: {
    DwdEditPoint,
  },
  data: () => ({
    confirmRemove: false,
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
    submit: function () {
      let promises = [];
      for (let si = 0; si < this.points.length; si++) {
        for (let pi = 0; pi < this.points[si].length; pi++) {
          let point = this.points[si][pi];
          if (point.newClaim) {
            let promise = this.$store.dispatch('addClaim', {
              claim: point.newClaim,
              points: [[], []],
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
    startRemove: function () {
      setTimeout(() => {
        this.confirmRemove = true;
        setTimeout(() => { this.confirmRemove = false; }, 2000);
      }, 200);
    },
    reallyRemove: function () {
      this.$store.dispatch('removeClaim', {
        id: this.id,
      }).then(() => {
        this.$router.push('/claims');
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
    sideString: function (i) {
      return ['for', 'against'][i];
    },
    getKey: function (point) {
      if (point.claim) return point.claim;
      if (point.source) return point.source;
      if (point.key) return point.key;
      point.key = Math.floor(Math.random() * 0x100000000).toString(16);
      return point.key;
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
