<template>
<div>
  <h3 class="center">
    Sources are external sources of data used to support claims.
  </h3>
  <router-link :to="addUrl" class="add click">+</router-link>
  <template v-if="sourcesLoaded">
    <router-link v-for="(source, id) in sources"
                 class="t1 bubble green"
                 :to="sourceUrl(id)"
                 :key="id">
      <div class="source-text">{{ source.text }}</div>
      <div class="source-url">{{ source.url }}</div>
    </router-link>
  </template>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from './DwdLoader.vue';

export default {
  components: {
    DwdLoader,
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
