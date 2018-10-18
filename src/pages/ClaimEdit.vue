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
import { mapGetters } from 'vuex';

import ClaimEditBlock from '@/components/ClaimEditBlock.vue';
import ClaimRevBlock from '@/components/ClaimRevBlock.vue';
import DeleteButton from '@/components/DeleteButton.vue';
import DwdLoader from '@/components/DwdLoader.vue';
import FixedBottom from '@/components/FixedBottom.vue';
import PointsEdit from '@/components/PointsEdit.vue';
import { ItemType } from '@/common/constants';
import { claimsAreEqual } from '@/common/equality';
import { parseTrail, splitPoints } from '@/utils';

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
  async asyncData({ store, route }) {
    const id = route.params.id;
    const claim = store.state.claims[id];
    if (id && (!claim || claim.depth < 2)) {
      await store.dispatch('getItem', {
        type: ItemType.CLAIM,
        id,
        trail: parseTrail(route.query.trail),
      });
    }
  },
  metaInfo() {
    return {
      title: `Editing claim ${this.id}`,
    };
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
    ...mapGetters('sort', ['combineAndSortPoints']),
    claim() {
      return this.$store.state.claims[this.id];
    },
    newClaim() {
      return {
        ...this.newClaimPartial,
        ...splitPoints(this.points),
      };
    },
    noChange() {
      return claimsAreEqual(this.claim, this.newClaim);
    },
    trail() {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: {
      immediate: true,
      handler: 'initialize',
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload(e) {
      if (this.unloadOverride || this.noChange) {
        // Don't warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
    updatePoints(points) {
      this.showEditBlock = false;
      this.points = points;
    },
    async submit() {
      let action = 'addItem';
      const payload = {
        type: ItemType.CLAIM,
        item: this.newClaim,
      };
      if (this.id) {
        action = 'updateItem';
        payload.item.id = this.id;
        payload.item.baseRev = this.claim.revId;
      }
      const id = await this.$store.dispatch(action, payload);
      this.unloadOverride = true;
      this.$router.push(this.claimUrl(id, this.trail));
    },
    async remove(message) {
      await this.$store.dispatch('removeItem', {
        type: ItemType.CLAIM,
        id: this.id,
        message,
      });
      this.unloadOverride = true;
      this.$router.push('/claims');
    },
    cancel() {
      const url = this.id ? this.claimUrl(this.id, this.trail) : '/claims';
      this.$router.push(url);
    },
    initialize() {
      const seed = this.seed || this.claim;
      if (seed && !seed.deleted) {
        this.newClaimPartial = seed;
        this.points = this.combineAndSortPoints(seed);
      }
      if (!this.seed && this.initAddPoint < 0) {
        this.showEditBlock = true;
      }
      this.initialized = true;
    },
  },
};
</script>
