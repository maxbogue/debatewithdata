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
    <points-edit v-if="initialized"
                 :curr="newClaim"
                 :prev="claim"
                 @update="updatePoints" />
    <div v-if="id" class="block center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <fixed-bottom class="center blue">
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="button"
              class="dwd-btn blue-dark"
              @click="submit">Submit</button>
    </fixed-bottom>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import ClaimEditModal from '../ClaimEditModal.vue';
import ClaimRevContent from '../ClaimRevContent.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointsEdit from '../PointsEdit.vue';
import {
  authRedirect, diffPointRevs, pointMapsToLists, rotateWithIndexes
} from '../utils';

export default {
  beforeRouteEnter: authRedirect,
  components: {
    ClaimEditModal,
    ClaimRevContent,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    PointsEdit,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    showModal: false,
    newClaimPartial: null,
    points: [[], []],
    pointOrder: null,
    initialized: false,
  }),
  computed: {
    claim: function () {
      return this.$store.state.claims[this.id];
    },
    needsData: function () {
      return this.id && (!this.claim || this.claim.depth < 3);
    },
    newClaim: function () {
      return {
        ...this.newClaimPartial,
        points: this.points,
      };
    },
    pointRevs: function () {
      // Without this flag, |pointRevs| takes form as soon as |claim| is set
      // and before |points| is set, making the PointEdit components mount with
      // null points and failing to initialize their subPoints field.
      if (!this.initialized) {
        return [[], []];
      }
      let pointRevs = diffPointRevs(this.newClaim, this.claim);
      if (!this.pointOrder) {
        return pointRevs;
      }
      // Sort by the point order.
      return map(pointRevs, (ps, si) =>
        sortBy(ps, (p) => this.pointOrder[si].indexOf(p[0])));
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.pointRevs);
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
    pointRevs: function () {
      if (!this.pointOrder) {
        // Initialize pointOrder with the order from diffPointRevs.
        this.pointOrder = map(this.pointRevs, (s) => map(s, ([id]) => id));
      }
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
  methods: {
    updatePoints: function (points) {
      this.points = points;
    },
    submit: function () {
      let action = 'addClaim';
      let payload = { claim: this.newClaim };
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
      let seed = this.seed || this.claim;
      if (seed && !seed.deleted) {
        this.newClaimPartial = seed;
        this.points = pointMapsToLists(seed.points);
      } else {
        this.showModal = true;
      }
      this.initialized = true;
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
