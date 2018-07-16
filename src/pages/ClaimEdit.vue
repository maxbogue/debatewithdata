<template>
<div>
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
    <button v-if="showEditBlock"
            type="button"
            class="dwd-btn blue-dark"
            @click="showEditBlock = false">Review</button>
    <button v-else
            :disabled="noChange"
            type="button"
            class="dwd-btn blue-dark"
            @click="submit">Submit</button>
  </fixed-bottom>
</div>
</template>

<script>
import ClaimEditBlock from '../ClaimEditBlock.vue';
import ClaimRevBlock from '../ClaimRevBlock.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import PointsEdit from '../PointsEdit.vue';
import { ItemType } from '../../common/constants';
import { authRedirect, combineAndSortPoints, parseTrail,
  splitPoints } from '../utils';
import { claimsAreEqual } from '../../common/equality';

const BEFORE_UNLOAD_MESSAGE = 'Discard changes?';

function confirmLeave(to, from, next) {
  /* eslint no-invalid-this: "off" */
  if (this.unloadOverride || this.noChange) {
    next();
    return;
  }
  if (!window.confirm(BEFORE_UNLOAD_MESSAGE)) {
    next(false);
  } else {
    next();
  }
}

export default {
  beforeRouteEnter: authRedirect,
  beforeRouteUpdate: confirmLeave,
  beforeRouteLeave: confirmLeave,
  components: {
    ClaimEditBlock,
    ClaimRevBlock,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    PointsEdit,
  },
  asyncData: async function ({ store, route }) {
    let id = route.params.id;
    let claim = store.state.claims[id];
    if (id && (!claim || claim.depth < 2)) {
      await store.dispatch('getItem', {
        type: ItemType.CLAIM,
        id,
        trail: parseTrail(route.query.trail),
      });
    }
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
    unloadOverride: false,
  }),
  computed: {
    claim: function () {
      return this.$store.state.claims[this.id];
    },
    newClaim: function () {
      return {
        ...this.newClaimPartial,
        ...splitPoints(this.points),
      };
    },
    noChange: function () {
      return claimsAreEqual(this.claim, this.newClaim);
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: function () {
      this.initialize();
    },
  },
  mounted: function () {
    this.initialize();
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy: function () {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload: function (e) {
      if (this.unloadOverride || this.noChange) {
        // Don't warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
    updatePoints: function (points) {
      this.showEditBlock = false;
      this.points = points;
    },
    submit: function () {
      let action = 'addItem';
      let payload = {
        type: ItemType.CLAIM,
        item: this.newClaim,
      };
      if (this.id) {
        action = 'updateItem';
        payload.item.id = this.id;
        payload.item.baseRev = this.claim.revId;
      }
      return this.$store.dispatch(action, payload).then((id) => {
        this.unloadOverride = true;
        this.$router.push(this.claimUrl(id, this.trail));
      });
    },
    remove: function (message) {
      this.$store.dispatch('removeItem', {
        type: ItemType.CLAIM,
        id: this.id,
        message,
      }).then(() => {
        this.unloadOverride = true;
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
  },
};
</script>
