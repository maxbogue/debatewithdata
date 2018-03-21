<template>
<div>
  <h3 class="center">
    Sources are external sources of data used to support claims.
  </h3>
  <div class="block no-pad center">
    <router-link :to="addUrl"
                 class="dwd-btn green-dark">New Source</router-link>
  </div>
  <dwd-loader ref="loader" />
  <template v-if="sourcesLoaded">
    <item-block v-for="source in sources"
                :key="source.id"
                :item="source"
                type="source"
                is-link
                abbreviated />
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { filterLiving } from '../utils';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  computed: {
    ...mapState([
      'sources',
      'sourcesLoaded',
      'user',
    ]),
    sources: function () {
      return filterLiving(this.$store.state.sources);
    },
    addUrl: function () {
      if (this.user) {
        return '/sources/add';
      }
      return '/login?next=/sources/add';
    },
  },
  mounted: function () {
    if (!this.sourcesLoaded) {
      this.$store.dispatch('getSources', { loader: this.$refs.loader });
    }
  },
};
</script>
