<template>
<div>
  <h3 class="center">Topics represent common topics of debate.</h3>
  <div class="block no-pad center">
    <router-link :to="addUrl" class="dwd-btn pink-dark">New Topic</router-link>
  </div>
  <dwd-loader ref="loader" />
  <template v-if="topicsLoaded">
    <item-block v-for="topic in rootTopics"
                :key="topic.id"
                :item="topic"
                type="topic"
                is-link
                abbreviated />
  </template>
</div>
</template>

<script>
import pickBy from 'lodash/pickBy';
import { mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { sortByStars } from '../utils';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  computed: {
    ...mapState([
      'topics',
      'topicsLoaded',
      'user',
    ]),
    rootTopics: function () {
      return sortByStars(pickBy(this.topics, (topic) => topic.depth === 1));
    },
    addUrl: function () {
      if (this.user) {
        return '/topics/add';
      }
      return '/login?next=/topics/add';
    },
  },
  mounted: function () {
    if (!this.topicsLoaded) {
      this.$store.dispatch('getTopics', { loader: this.$refs.loader });
    }
  },
};
</script>
