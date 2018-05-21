<template>
<div>
  <h3 class="center">Topics represent common topics of debate.</h3>
  <div class="flex-block">
    <input v-model="query" type="text" placeholder="search">
    <router-link v-if="user && user.admin"
                 :to="addUrl"
                 class="dwd-btn pink-dark">New Topic</router-link>
  </div>
  <dwd-loader ref="loader" />
  <div v-if="results && results.length === 0"
       class="block no-pad">No results.</div>
  <template v-if="topicsLoaded">
    <item-block v-for="topic in topics"
                :key="topic.id"
                :item="topic"
                type="topic"
                abbreviated
                is-link
                mini />
  </template>
</div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapGetters, mapState } from 'vuex';

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
      'topicsLoaded',
      'user',
    ]),
    ...mapGetters([
      'rootTopics',
    ]),
    topics: function () {
      if (this.query) {
        return this.results || [];
      }
      return sortByStars(filterLiving(this.rootTopics));
    },
    addUrl: function () {
      if (this.user) {
        return '/topics/add';
      }
      return '/login?next=/topics/add';
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
        types: [ItemType.TOPIC],
        limit: 20,
        loader: this.$refs.loader,
      }).then((results) => {
        if (query === this.query) {
          this.results = results.map((result) => this.lookupTopic(result.id));
        }
      });
    }, DEBOUNCE_DELAY_MS),
  },
  mounted: function () {
    if (!this.topicsLoaded) {
      this.$store.dispatch('getTopics', { loader: this.$refs.loader });
    }
  },
};
</script>
