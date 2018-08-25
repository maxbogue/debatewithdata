<template>
<div>
  <h3 class="center">{{ headerText }}</h3>
  <div class="flex-block" :class="$style.bar">
    <template v-if="!query">
      <select v-model="sortBy" aria-label="Sort By">
        <option :value="Sort.STARS">Stars</option>
        <option :value="Sort.RECENT">Recent</option>
      </select>
      <span class="fas click"
            :class="'fa-sort-alpha-' + (sortDesc ? 'down' : 'up')"
            @click="sortDesc = !sortDesc"></span>
      <span v-if="user"
            class="fa-star click"
            :class="starFilterClasses"
            @click="cycleStarFilter"></span>
    </template>
    <input v-model="query"
           type="text"
           placeholder="search"
           aria-label="Search">
    <router-link v-if="type === ItemType.TOPIC && user && user.admin"
                 to="/topics/add"
                 class="dwd-btn pink-dark">New Topic</router-link>
    <router-link v-else-if="type === ItemType.CLAIM"
                 to="/claims/add"
                 class="dwd-btn blue-dark">New Claim</router-link>
    <router-link v-else-if="type === ItemType.SOURCE"
                 to="/datas/add"
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
  <div v-if="numPages" class="block no-pad mono" :class="$style.pages">
    <span v-for="p in numPages"
          :key="`page-${p}`"
          class="click"
          :class="{ [$style.active]: p === page }"
          @click="page = p">{{ p }}</span>
  </div>
</div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapState } from 'vuex';

import DwdLoader from '@/components/DwdLoader.vue';
import ItemBlock from '@/components/ItemBlock.vue';
import { DEBOUNCE_DELAY_MS } from '@/constants';
import { Filter, ItemType, Sort } from '@/common/constants';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  metaInfo() {
    let title = {
      [ItemType.TOPIC]: 'Topics',
      [ItemType.CLAIM]: 'Claims',
      [ItemType.SOURCE]: 'Data',
    }[this.type];
    return { title };
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
    numPages: 0,
    page: 1,
  }),
  computed: {
    ...mapState(['user']),
    headerText() {
      switch (this.type) {
      case ItemType.TOPIC:
        return 'Topics represent common areas of debate.';
      case ItemType.CLAIM:
        return 'Claims are simple statements about the world.';
      case ItemType.SOURCE:
        return 'Data are external sources of information used to support '
          + 'claims.';
      }
      throw new Error(`Invalid item type: ${this.type}`);
    },
    paramsWithoutPage() {
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
    params() {
      return {
        ...this.paramsWithoutPage,
        page: this.page,
      };
    },
    queryParams() {
      if (!this.query) {
        return null;
      }
      return {
        types: [this.type],
        query: this.query,
        page: this.page,
      };
    },
    items() {
      if (!this.results) {
        return [];
      }
      return this.results.map((result) => this.lookupItem(this.type, result));
    },
    starFilterClasses() {
      return [this.filterStarred ? 'fas' : 'far', {
        [this.$style.starFilterActive]: this.filterStarred !== null,
      }];
    },
  },
  watch: {
    type() {
      this.sortBy = Sort.STARS;
      this.sortDesc = true;
      this.filterStarred = null;
      this.query = '';
      this.results = null;
      this.numPages = 0;
      this.page = 1;
    },
    paramsWithoutPage() {
      this.page = 1;
    },
    params() {
      if (this.query) {
        return;
      }
      this.getItems();
    },
    query() {
      this.page = 1;
    },
    queryParams: debounce(async function () {
      /* eslint no-invalid-this: "off" */
      this.results = null;
      if (!this.queryParams) {
        this.getItems();
        return;
      }
      let query = this.query;
      this.loading = true;
      let { results, numPages } = await this.$store.dispatch('search', {
        ...this.queryParams,
        loader: this.$refs.loader,
      });
      if (query === this.query) {
        this.results = results.map((result) => result.id);
        this.numPages = numPages;
      }
    }, DEBOUNCE_DELAY_MS),
  },
  mounted() {
    this.getItems();
  },
  methods: {
    async getItems() {
      this.results = null;
      let { results, numPages } = await this.$store.dispatch('getItems', {
        ...this.params,
        page: this.page,
        loader: this.$refs.loader,
      });
      if (!this.query) {
        this.results = results;
        this.numPages = numPages;
      }
    },
    cycleStarFilter() {
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

.pages {
  text-align: center;

  span:not(:first-child) {
    margin-left: 4px;
  }

  span:hover {
    text-decoration: underline;
  }

  .active {
    font-weight: bold;
  }
}
</style>
