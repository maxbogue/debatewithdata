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
import ClaimEditModal from '../ClaimEditModal.vue';
import ClaimRevContent from '../ClaimRevContent.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointsEdit from '../PointsEdit.vue';
import { authRedirect, combineAndSortPoints, splitPoints } from '../utils';

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
      } else {
        this.showModal = true;
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
