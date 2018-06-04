<template>
<div>
  <h3 class="center">{{ headerText }}</h3>
  <div class="flex-block" :class="$style.bar">
    <template v-if="!query">
      <select v-model="sortBy">
        <option :value="Sort.STARS">Stars</option>
        <option :value="Sort.RECENT">Recent</option>
      </select>
      <span class="fas click"
            :class="'fa-sort-alpha-' + (sortDesc ? 'down' : 'up')"
            @click="sortDesc = !sortDesc"></span>
      <span class="fa-star click"
            :class="starFilterClasses"
            @click="cycleStarFilter"></span>
    </template>
    <input v-model="query" type="text" placeholder="search">
    <router-link v-if="type === ItemType.CLAIM"
                 to="/claims/add"
                 class="dwd-btn blue-dark">New Claim</router-link>
    <router-link v-else-if="type === ItemType.SOURCE"
                 to="/sources/add"
                 class="dwd-btn green-dark">New Data</router-link>
  </div>
  <dwd-loader ref="loader" />
  <div v-if="results && results.length === 0"
       class="block no-pad">No results.</div>
  <item-block v-for="item in items"
              :key="item.id"
              :item="item"
              :type="type"
              abbreviated
              is-link
              mini
              fade-only />
</div>
</template>

<script>
import debounce from 'lodash/debounce';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { DEBOUNCE_DELAY_MS } from '../constants';
import { Filter, ItemType, Sort } from '../../common/constants';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  props: {
    type: { type: String, required: true },
  },
  data: () => ({
    ItemType,
    Sort,
    Filter,
    sortBy: Sort.STARS,
    sortDesc: true,
    filterStarred: null,
    query: '',
    results: null,
  }),
  computed: {
    headerText: function () {
      switch (this.type) {
      case ItemType.CLAIM:
        return 'Claims are simple statements about the world.';
      case ItemType.SOURCE:
        return 'Data are external sources of data used to support claims.';
      }
      return '';
    },
    params: function () {
      let filters = [];
      if (this.filterStarred !== null) {
        filters.push([Filter.STARRED, this.filterStarred]);
      }
      return {
        type: this.type,
        sort: [this.sortBy, this.sortDesc],
        filters,
      };
    },
    items: function () {
      if (!this.results) {
        return [];
      }
      return this.results.map((result) => this.lookupItem(this.type, result));
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
      this.getItems();
    },
    query: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.results = null;
      if (!this.query) {
        this.getItems();
        return;
      }
      let query = this.query;
      this.loading = true;
      this.$store.dispatch('search', {
        query,
        types: [this.type],
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
    this.getItems();
  },
  methods: {
    getItems: function () {
      this.results = null;
      this.$store.dispatch('getItems', {
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
