<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <div class="block no-pad center">
    <router-link :to="addUrl" class="dwd-btn blue-dark">New Claim</router-link>
  </div>
  <dwd-loader ref="loader" />
  <template v-if="claimsLoaded">
    <item-block v-for="claim in claims"
                :key="claim.id"
                :item="claim"
                type="claim"
                is-link
                abbreviated />
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { filterLiving, sortByStars } from '../utils';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  computed: {
    ...mapState([
      'claimsLoaded',
      'user',
    ]),
    claims: function () {
      return sortByStars(filterLiving(this.$store.state.claims));
    },
    addUrl: function () {
      if (this.user) {
        return '/claims/add';
      }
      return '/login?next=/claims/add';
    },
  },
  mounted: function () {
    if (!this.claimsLoaded) {
      this.$store.dispatch('getClaims', { loader: this.$refs.loader });
    }
  },
};
</script>
