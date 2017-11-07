<template>
<div>
  <h3 class="center">
    Sources are external sources of data used to support claims.
  </h3>
  <div class="center">
    <router-link :to="addUrl" class="add green-dark">New Source</router-link>
  </div>
  <template v-if="sourcesLoaded">
    <div v-for="source in sources"
         class="source t1 neutral"
         :key="source.id">
      <router-link class="bubble"
                   :to="sourceUrl(source.id)">
        <source-content :source="source"></source-content>
      </router-link>
    </div>
  </template>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from './DwdLoader.vue';
import SourceContent from './SourceContent.vue';

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
    addUrl: function () {
      if (this.user) {
        return '/sources/add';
      }
      return '/login?next=/sources/add';
    },
  },
  mounted: function () {
    this.$store.dispatch('getSources', { loader: this.$refs.loader });
  },
};
</script>
