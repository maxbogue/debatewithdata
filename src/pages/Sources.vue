<template>
<div>
  <h3 class="center">
    Data are external sources of data used to support claims.
  </h3>
  <div class="flex-block">
    <input v-model="query" type="text" placeholder="search">
    <router-link :to="addUrl" class="dwd-btn green-dark">New Data</router-link>
  </div>
  <dwd-loader ref="loader" />
  <div v-if="results && results.length === 0"
       class="block no-pad">No results.</div>
  <item-block v-for="source in sources"
              :key="source.id"
              :item="source"
              type="source"
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
import { filterLiving } from '../utils';

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
      'sourcesLoaded',
      'user',
    ]),
    sources: function () {
      if (this.query) {
        return this.results || [];
      } else if (this.sourcesLoaded) {
        return filterLiving(this.$store.state.sources);
      }
      return [];
    },
    addUrl: function () {
      if (this.user) {
        return '/datas/add';
      }
      return '/login?next=/datas/add';
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
        types: [ItemType.SOURCE],
        limit: 20,
        loader: this.$refs.loader,
      }).then((results) => {
        if (query === this.query) {
          this.results = results.map((result) => this.lookupSource(result.id));
        }
      });
    }, DEBOUNCE_DELAY_MS),
  },
  mounted: function () {
    if (!this.sourcesLoaded) {
      this.$store.dispatch('getSources', { loader: this.$refs.loader });
    }
  },
};
</script>
