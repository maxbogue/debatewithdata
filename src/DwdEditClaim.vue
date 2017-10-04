<template>
<div>
  <form v-if="claim" class="row gutter-16" @submit.prevent="submit">
    <div class="col-xs-12">
      <div class="t1 bubble blue flex-row">
        <div class="content">
          <div>
            <label for="text" class="hint">
              A claim should be a short, simple statement about the world.
            </label>
            <textarea id="text"
                      rows="1"
                      autocomplete="off"
                      placeholder="claim"
                      v-model="text"
                      v-auto-resize></textarea>
          </div>
          <dwd-flag v-if="flag" :flag="flag"></dwd-flag>
        </div>
        <div class="controls">
          <dwd-flag-dropdown :flag="flag"
                             @select="updateFlag"></dwd-flag-dropdown>
        </div>
      </div>
    </div>
    <template v-if="$store.state.singleColumn">
      <div v-for="[point, side, i] in zippedPoints"
           class="col-xs-12"
           :key="point.id || point.tempId">
        <dwd-edit-point :point="point"
                        :side="side"
                        :canDelete="i < points[side].length - 1"
                        @update="(p) => updatePoint(side, i, p)"
                        @delete="points[side].splice(i, 1)">
        </dwd-edit-point>
      </div>
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in points"
           class="col-sm-6"
           :key="'side-' + side">
        <dwd-edit-point v-for="(point, i) in sidePoints"
                        :point="point"
                        :side="side"
                        :canDelete="i < sidePoints.length - 1"
                        :key="point.id || point.tempId"
                        @update="(p) => updatePoint(side, i, p)"
                        @delete="sidePoints.splice(i, 1)">
        </dwd-edit-point>
      </div>
    </template>
    <div v-if="error" class="col-xs-12 center">{{ error }}</div>
    <div class="col-xs-12 center">
      <button type="submit" class="btn btn-default">Submit</button>
      <button type="button"
              class="btn btn-default"
              @click="cancel">Cancel</button>
    </div>
    <div v-if="id" class="col-xs-12 center">
      <delete-button noun="Claim" @delete="remove"></delete-button>
    </div>
  </form>
  <div v-else-if="!loaded">Loading...</div>
  <div v-else>Claim not found.</div>
</div>
</template>

<script>
import { filter } from 'lodash';

import DeleteButton from './DeleteButton.vue';
import DwdEditPoint from './DwdEditPoint.vue';
import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import {
  emptyPoint, emptyPoints, isValidPoint, pointMapsToLists, rotateWithIndexes
} from './utils';

export default {
  components: {
    DeleteButton,
    DwdEditPoint,
    DwdFlag,
    DwdFlagDropdown,
  },
  data: () => ({
    loaded: false,
    error: '',
    points: emptyPoints(),
    text: '',
    flag: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.claimId || '';
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
  },
  methods: {
    updatePoint: function (si, pi, point) {
      this.$set(this.points[si], pi, point);
      if (pi === this.points[si].length - 1) {
        this.points[si].push(emptyPoint());
      }
    },
    updateFlag: function (flag) {
      this.flag = flag;
    },
    submit: function () {
      let promises = [];
      for (let si = 0; si < this.points.length; si++) {
        for (let pi = 0; pi < this.points[si].length; pi++) {
          let point = this.points[si][pi];
          if (point.type === 'newSource') {
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
          flag: this.flag,
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
      this.text = this.claim.text;
      this.points = pointMapsToLists(this.claim.points);
      this.flag = this.claim.flag;
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].push(emptyPoint());
      }
    },
    checkLoaded: function () {
      if (!this.claim || this.claim.depth < 3) {
        this.loaded = false;
        this.$store.dispatch('getClaim', { id: this.id }).then(() => {
          this.loaded = true;
          this.initialize();
        });
      } else {
        this.loaded = true;
        this.initialize();
      }
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
};
</script>
