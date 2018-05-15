<template>
<div>
  <h1>{{ username }}</h1>
  <dwd-loader ref="loader" />
  <template v-if="user">
    <div :class="$style.timestamp">{{ user.createdAt | shortTimestamp }}</div>
    <h2>Activity</h2>
    <activity-list :activity="user.activity" hide-username />
  </template>
</div>
</template>

<script>
import axios from 'axios';

import ActivityList from '../ActivityList.vue';
import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    ActivityList,
    DwdLoader,
  },
  props: {
    username: { type: String, required: true },
  },
  data: () => ({
    user: null,
  }),
  watch: {
    username: function () {
      this.loadUser();
    },
  },
  mounted: function () {
    this.loadUser();
  },
  methods: {
    loadUser: function () {
      if (!this.username) {
        return;
      }
      this.user = null;
      let loader = this.$refs.loader;
      axios.get('/api/user/' + this.username, { loader }).then((res) => {
        this.user = res.data;
      });
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.timestamp {
  color: $text-dark-accent;
}
</style>
