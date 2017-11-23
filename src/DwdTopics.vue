<template>
<div>
  <h3 class="center">Topics represent common topics of debate.</h3>
  <div class="center">
    <router-link :to="addUrl" class="add pink-dark">New Topic</router-link>
  </div>
  <dwd-loader ref="loader"></dwd-loader>
  <template v-if="topicsLoaded">
    <router-link v-for="topic in topics"
                 class="topic block"
                 :to="topicUrl(topic.id)"
                 :key="topic.id">
      {{ topic.title }}
    </router-link>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdLoader from './DwdLoader.vue';
import { sortByStars } from './utils';

export default {
  components: {
    DwdLoader,
  },
  computed: {
    ...mapState([
      'topicsLoaded',
      'user',
    ]),
    topics: function () {
      return sortByStars(this.$store.state.topics);
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
