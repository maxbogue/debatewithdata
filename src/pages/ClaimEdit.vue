<template>
<div>
  <form v-if="!needsData" @submit.prevent="submit">
    <div class="claim t1">
      <div class="bubble">
        <label for="text" class="hint">
          A claim should be a short, simple statement about the world.
        </label>
        <textarea id="text"
                  rows="1"
                  autocomplete="off"
                  placeholder="claim"
                  v-model="text"
                  v-auto-resize></textarea>
        <dwd-flag v-if="flag" :flag="flag" />
      </div>
      <div v-if="text" class="info">
        <span class="id mono">{{ id || 'new' }}</span>
        <dwd-flag-dropdown :flag="flag"
                            @select="updateFlag" />
      </div>
    </div>
    <template v-if="$store.state.singleColumn">
      <dwd-edit-point v-for="[point, side, i] in zippedPoints"
                      :key="point.id || point.tempId"
                      :point="point"
                      :isFor="!side"
                      :canDelete="i < points[side].length - 1"
                      @update="(p) => updatePoint(side, i, p)"
                      @delete="points[side].splice(i, 1)" />
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in points"
           class="dwd-col"
           :key="'side-' + side">
        <dwd-edit-point v-for="(point, i) in sidePoints"
                        :key="point.id || point.tempId"
                        :point="point"
                        :isFor="!side"
                        :canDelete="i < sidePoints.length - 1"
                        @update="(p) => updatePoint(side, i, p)"
                        @delete="sidePoints.splice(i, 1)" />
      </div>
    </template>
    <div v-if="id" class="block center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <fixed-bottom class="center blue">
      <button type="submit" class="dwd-btn blue-dark">Submit</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
    </fixed-bottom>
  </form>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import filter from 'lodash/filter';

import DeleteButton from '../DeleteButton.vue';
import DwdEditPoint from '../DwdEditPoint.vue';
import DwdFlag from '../DwdFlag.vue';
import DwdFlagDropdown from '../DwdFlagDropdown.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import {
  emptyPoint, emptyPoints, isValidPoint, pointMapsToLists, rotateWithIndexes
} from '../utils';

function makeNewSources(store, points) {
  let promises = [];
  for (let si = 0; si < points.length; si++) {
    for (let pi = 0; pi < points[si].length; pi++) {
      let point = points[si][pi];
      if (point.type === 'newSource') {
        let promise = store.dispatch('addSource', {
          source: point.newSource,
        }).then((sourceId) => {
          points[si][pi] = { type: 'source', sourceId };
        });
        promises.push(promise);
      } else if (point.type === 'subclaim') {
        promises.push(...makeNewSources(store, point.points));
      }
    }
  }
  return promises;
}

function filterPoints(points) {
  for (let si = 0; si < points.length; si++) {
    for (let pi = 0; pi < points[si].length; pi++) {
      let point = points[si][pi];
      if (point.type === 'subclaim') {
        filterPoints(point.points);
      }
    }
    points[si] = filter(points[si], isValidPoint);
  }
}

export default {
  components: {
    DeleteButton,
    DwdEditPoint,
    DwdFlag,
    DwdFlagDropdown,
    DwdLoader,
    FixedBottom,
  },
  data: () => ({
    points: emptyPoints(),
    text: '',
    flag: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    claim: function () {
      return this.$store.state.claims[this.id] || null;
    },
    needsData: function () {
      return this.id && (!this.claim || this.claim.depth < 3);
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
      let promises = makeNewSources(this.$store, this.points);
      Promise.all(promises).then(() => {
        filterPoints(this.points);
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
      if (this.flag) {
        payload.claim.flag = this.flag;
      }
      if (this.id) {
        action = 'updateClaim';
        payload.id = this.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.claimUrl(id));
      });
    },
    remove: function () {
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
      this.text = this.claim.text;
      this.points = pointMapsToLists(this.claim.points);
      this.flag = this.claim.flag;
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].push(emptyPoint());
      }
    },
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getClaim', {
          id: this.id,
          loader: this.$refs.loader,
        }).then(() => {
          this.initialize();
        });
      } else if (this.id) {
        // Adding a new claim.
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
