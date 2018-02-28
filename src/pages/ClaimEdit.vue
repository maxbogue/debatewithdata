<template>
<div>
  <template v-if="!needsData">
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
      <div class="point block for click"
           @click="addPoint(0)">
        <strong>Add a point for this claim.</strong>
      </div>
      <div class="point block against click" @click="addPoint(1)">
        <strong>Add a point against this claim.</strong>
      </div>
      <point-edit v-for="[point, side, i] in zippedPoints"
                  :key="point.id || point.tempId"
                  :point="point"
                  :is-for="!side"
                  @update="(p) => updatePoint(side, i, p)"
                  @delete="points[side].splice(i, 1)" />
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in points"
           class="dwd-col"
           :key="'side-' + side">
        <div class="point block click"
             :class="!side | toSideString"
             @click="addPoint(side)">
          <strong>Add a point {{ !side | toSideString }} this claim.</strong>
        </div>
        <point-edit v-for="(point, i) in sidePoints"
                    :key="point.id || point.tempId"
                    :point="point"
                    :is-for="!side"
                    @update="(p) => updatePoint(side, i, p)"
                    @delete="sidePoints.splice(i, 1)" />
      </div>
    </template>
    <div v-if="id" class="block center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <fixed-bottom class="center blue">
      <button type="button"
              class="dwd-btn blue-dark"
              @click="submit">Submit</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
    </fixed-bottom>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import ClaimEditModal from '../ClaimEditModal.vue';
import ClaimRevContent from '../ClaimRevContent.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointEdit from '../PointEdit.vue';
import {
  emptyPoint, pointMapsToLists, rotateWithIndexes
} from '../utils';

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
    newClaimPartial: null,
    points: [[], []],
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
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
  methods: {
    addPoint: function (si) {
      this.points[si].splice(0, 0, emptyPoint());
    },
    updatePoint: function (si, pi, point) {
      if (!point.type) {
        this.points[si].splice(pi, 1);
        return;
      }
      this.$set(this.points[si], pi, point);
    },
    submit: function () {
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
    remove: function (message) {
      this.$store.dispatch('removeClaim', {
        id: this.id,
        message,
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
};
</script>
