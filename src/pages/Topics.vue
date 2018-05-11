<template>
<div>
  <h3 class="center">Topics represent common topics of debate.</h3>
  <div v-if="user && user.admin" class="block no-pad center">
    <router-link :to="addUrl"
                 class="dwd-btn pink-dark"
                 >New Root Topic</router-link>
  </div>
  <dwd-loader ref="loader" />
  <template v-if="topicsLoaded">
    <item-block v-for="topic in topics"
                :key="topic.id"
                :item="topic"
                type="topic"
                is-link
                abbreviated />
  </template>
</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';
import { filterLiving, sortByStars } from '../utils';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  computed: {
    ...mapState([
      'topicsLoaded',
      'user',
    ]),
    ...mapGetters([
      'rootTopics',
    ]),
    topics: function () {
      return sortByStars(filterLiving(this.rootTopics));
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
