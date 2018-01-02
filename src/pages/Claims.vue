<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <div class="block no-pad center">
    <router-link :to="addUrl" class="dwd-btn blue-dark">New Claim</router-link>
  </div>
  <dwd-loader ref="loader"></dwd-loader>
  <template v-if="claimsLoaded">
    <router-link v-for="claim in claims"
                 class="claim block"
                 :to="claimUrl(claim.id)"
                 :key="claim.id">
        <claim-content :claim="claim"></claim-content>
    </router-link>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import ClaimContent from '../ClaimContent.vue';
import DwdLoader from '../DwdLoader.vue';
import { sortByStars } from '../utils';

export default {
  components: {
    ClaimContent,
    DwdLoader,
  },
  computed: {
    ...mapState([
      'claimsLoaded',
      'user',
    ]),
    claims: function () {
      return sortByStars(this.$store.state.claims);
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
