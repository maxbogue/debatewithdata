<template>
<div>
  <template v-if="!needsData">
    <claim-edit-block v-if="showEditBlock"
                      :claim.sync="newClaimPartial"
                      @close="showEditBlock = false" />
    <claim-rev-block v-else
                     :prev="claim"
                     :curr="newClaimPartial"
                     can-edit
                     @start-editing="showEditBlock = true" />
    <points-edit v-if="initialized"
                 :curr="newClaim"
                 :prev="claim"
                 :init-add-point="initAddPoint"
                 @update="updatePoints" />
    <div v-if="id" class="block center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <fixed-bottom class="center blue">
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button :disabled="showEditBlock"
              type="button"
              class="dwd-btn blue-dark"
              @click="submit">Submit</button>
    </fixed-bottom>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import ClaimEditBlock from '../ClaimEditBlock.vue';
import ClaimRevBlock from '../ClaimRevBlock.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointsEdit from '../PointsEdit.vue';
import { authRedirect, combineAndSortPoints, splitPoints } from '../utils';

export default {
  beforeRouteEnter: authRedirect,
  components: {
    ClaimEditBlock,
    ClaimRevBlock,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    PointsEdit,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
    initAddPoint: { type: Number, default: -1 },
  },
  data: () => ({
    showEditBlock: false,
    newClaimPartial: null,
    points: [[], []],
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
        ...splitPoints(this.points),
      };
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
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
    updatePoints: function (points) {
      this.points = points;
    },
    submit: function () {
      let action = 'addClaim';
      let payload = { claim: this.newClaim };
      if (this.id) {
        action = 'updateClaim';
        payload.id = this.id;
        payload.claim.baseRev = this.claim.revId;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.claimUrl(id, this.trail));
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
      let url = this.id ? this.claimUrl(this.id, this.trail) : '/claims';
      this.$router.push(url);
    },
    initialize: function () {
      let seed = this.seed || this.claim;
      if (seed && !seed.deleted) {
        this.newClaimPartial = seed;
        this.points = combineAndSortPoints(seed, this.$store.state);
      }
      if (!this.seed && this.initAddPoint < 0) {
        this.showEditBlock = true;
      }
      this.initialized = true;
    },
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getClaim', {
          id: this.id,
          trail: this.trail,
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
