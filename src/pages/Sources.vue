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
    <router-link v-for="source in sources"
                 class="source block"
                 :to="sourceUrl(source.id)"
                 :key="source.id">
      <source-content :source="source" />
    </router-link>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import SourceContent from '../SourceContent.vue';
import { filterLiving } from '../utils';

export default {
  components: {
    DwdLoader,
    SourceContent,
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
