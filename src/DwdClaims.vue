<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <div class="center">
    <router-link :to="addUrl" class="add blue-dark">New Claim</router-link>
  </div>
  <template v-if="claimsLoaded">
    <div v-for="claim in claims"
         class="claim t1 neutral"
         :key="claim.id">
      <router-link class="bubble"
                   :to="claimUrl(claim.id)">{{ claim.text }}</router-link>
    </div>
  </template>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from './DwdLoader.vue';
import { prepAndSortByStars } from './utils';

export default {
  components: {
    DwdLoader,
  },
  computed: {
    ...mapState([
      'claimsLoaded',
      'user',
    ]),
    claims: function () {
      return prepAndSortByStars(this.$store.state.claims);
    },
    addUrl: function () {
      if (this.user) {
        return '/claims/add';
      }
      return '/login?next=/claims/add';
    },
  },
  mounted: function () {
    this.$store.dispatch('getClaims', { loader: this.$refs.loader });
  },
};
</script>
