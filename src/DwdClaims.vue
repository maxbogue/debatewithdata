<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <router-link :to="addUrl" class="add click">+</router-link>
  <template v-if="claimsLoaded">
    <router-link v-for="claim in claims"
                 class="t1 bubble blue"
                 :to="claimUrl(claim.id)"
                 :key="claim.id">
      {{ claim.text }}
    </router-link>
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
