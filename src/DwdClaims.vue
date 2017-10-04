<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <template v-if="loaded">
    <router-link :to="addUrl" class="add click">+</router-link>
    <router-link v-for="claim in claims"
                 class="t1 bubble blue"
                 :to="claimUrl(claim.id)"
                 :key="claim.id">
      {{ claim.text }}
    </router-link>
  </template>
  <div v-else>Loading...</div>
</div>
</template>

<script>
import { mapState } from 'vuex';

import { prepAndSortByStars } from './utils';

export default {
  data: () => ({
    loaded: false,
  }),
  computed: {
    ...mapState([
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
    this.$store.dispatch('getClaims').then(() => {
      this.loaded = true;
    });
  },
};
</script>
