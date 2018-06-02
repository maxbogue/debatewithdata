<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <div class="flex-block" :class="$style.bar">
    <template v-if="!query">
      <select v-model="sortBy">
        <option :value="Sort.STARS">Stars</option>
        <option :value="Sort.UPDATED">Recent</option>
      </select>
      <span class="fas click"
            :class="'fa-sort-alpha-' + (sortDesc ? 'down' : 'up')"
            @click="sortDesc = !sortDesc"></span>
      <span class="fa-star click"
            :class="starFilterClasses"
            @click="cycleStarFilter"></span>
    </template>
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
              mini
              fade-only />
</div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { DEBOUNCE_DELAY_MS } from '../constants';
import { Filter, ItemType, Sort } from '../../common/constants';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  data: () => ({
    Sort,
    Filter,
    sortBy: Sort.STARS,
    sortDesc: true,
    filterStarred: null,
    query: '',
    results: null,
  }),
  computed: {
    ...mapState([
      'user',
    ]),
    params: function () {
      let filters = [];
      if (this.filterStarred !== null) {
        filters.push([Filter.STARRED, this.filterStarred]);
      }
      return {
        sort: [this.sortBy, this.sortDesc],
        filters,
      };
    },
    claims: function () {
      if (!this.results) {
        return [];
      }
      return this.results.map((result) => this.lookupClaim(result));
    },
    addUrl: function () {
      if (this.user) {
        return '/claims/add';
      }
      return '/login?next=/claims/add';
    },
    starFilterClasses: function () {
      return [this.filterStarred ? 'fas' : 'far', {
        [this.$style.starFilterActive]: this.filterStarred !== null,
      }];
    },
  },
  watch: {
    params: function () {
      if (this.query) {
        return;
      }
      this.getClaims();
    },
    query: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.results = null;
      if (!this.query) {
        this.getClaims();
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
          this.results = results.map((result) => result.id);
        }
      });
    }, DEBOUNCE_DELAY_MS),
  },
  mounted: function () {
    this.getClaims();
  },
  methods: {
    getClaims: function () {
      this.results = null;
      this.$store.dispatch('getClaims', {
        ...this.params,
        loader: this.$refs.loader,
      }).then((results) => {
        if (!this.query) {
          this.results = results;
        }
      });
    },
    cycleStarFilter: function () {
      if (this.filterStarred === null) {
        this.filterStarred = true;
      } else if (this.filterStarred) {
        this.filterStarred = false;
      } else {
        this.filterStarred = null;
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.bar {
  :not(:first-child) {
    margin-left: 8px;
  }

  :global(.click) {
    color: $transparent-light;
    font-size: 1.2em;

    &:hover {
      color: $transparent-dark;
    }
  }

  :global(.click).starFilterActive {
    color: $blue-dark-primary;

    &:hover {
      color: $blue-dark-accent;
    }
  }
}
</style>
