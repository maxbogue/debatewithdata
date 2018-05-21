<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <div class="flex-block">
    <input v-model="query" type="text" placeholder="search">
    <router-link :to="addUrl" class="dwd-btn blue-dark">New Claim</router-link>
  </div>
  <dwd-loader ref="loader" />
  <div v-if="results && results.length === 0"
       class="block no-pad">No results.</div>
  <item-block v-for="claim in claims"
              :key="claim.id"
              :item="claim"
              type="claim"
              abbreviated
              is-link
              mini />
</div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { DEBOUNCE_DELAY_MS } from '../constants';
import { ItemType } from '../../common/constants';
import { filterLiving, sortByStars } from '../utils';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  data: () => ({
    query: '',
    results: null,
  }),
  computed: {
    ...mapState([
      'claimsLoaded',
      'user',
    ]),
    claims: function () {
      if (this.query) {
        return this.results || [];
      }
      return sortByStars(filterLiving(this.$store.state.claims));
    },
    addUrl: function () {
      if (this.user) {
        return '/claims/add';
      }
      return '/login?next=/claims/add';
    },
  },
  watch: {
    query: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.results = null;
      if (!this.query) {
        return;
      }
      let query = this.query;
      this.loading = true;
      this.$store.dispatch('search', {
        query,
        types: [ItemType.CLAIM],
        limit: 20,
        loader: this.$refs.loader,
      }).then((results) => {
        if (query === this.query) {
          this.results = results.map((result) => this.lookupClaim(result.id));
        }
      });
    }, DEBOUNCE_DELAY_MS),
  },
  mounted: function () {
    if (!this.claimsLoaded) {
      this.$store.dispatch('getClaims', { loader: this.$refs.loader });
    }
  },
};
</script>
