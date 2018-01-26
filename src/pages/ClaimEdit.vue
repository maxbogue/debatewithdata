<template>
<div>
  <form v-if="!needsData" @submit.prevent="submit">
    <div class="claim t1">
      <claim-rev-content class="bubble click"
                         :prev="claim"
                         :curr="newClaimPartial"
                         @click.native="showModal = true" />
      <div class="info">
        <span class="id mono">{{ id || 'new' }}</span>
      </div>
    </div>
    <claim-edit-modal :show.sync="showModal"
                      :claim.sync="newClaimPartial" />
    <template v-if="$store.state.singleColumn">
      <point-edit v-for="[point, side, i] in zippedPoints"
                  :key="point.id || point.tempId"
                  :point="point"
                  :isFor="!side"
                  @update="(p) => updatePoint(side, i, p)"
                  @delete="points[side].splice(i, 1)" />
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in points"
           class="dwd-col"
           :key="'side-' + side">
        <point-edit v-for="(point, i) in sidePoints"
                    :key="point.id || point.tempId"
                    :point="point"
                    :isFor="!side"
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

import ClaimEditModal from '../ClaimEditModal.vue';
import ClaimRevContent from '../ClaimRevContent.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointEdit from '../PointEdit.vue';
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
          source: point.source,
        }).then((sourceId) => {
          points[si][pi] = { type: 'source', sourceId };
          if (point.id) {
            points[si][pi].id = point.id;
          }
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
    ClaimEditModal,
    ClaimRevContent,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    PointEdit,
  },
  data: () => ({
    showModal: false,
    newClaimPartial: undefined,
    points: emptyPoints(),
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    claim: function () {
      return this.$store.state.claims[this.id];
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
      if (!point.type) {
        if (pi > 0) {
          this.points[si].splice(pi, 1);
        }
        return;
      }
      this.$set(this.points[si], pi, point);
      if (pi === 0) {
        this.points[si].splice(0, 0, emptyPoint());
      }
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
          ...this.newClaimPartial,
          points: this.points,
        },
      };
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
      if (this.claim) {
        this.newClaimPartial = this.claim;
        this.points = pointMapsToLists(this.claim.points);
        for (let i = 0; i < this.points.length; i++) {
          this.points[i].splice(0, 0, emptyPoint());
        }
      } else {
        this.showModal = true;
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
      } else {
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
