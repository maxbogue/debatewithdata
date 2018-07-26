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
import ActivityList from '../components/ActivityList.vue';
import DwdLoader from '../components/DwdLoader.vue';

export default {
  components: {
    ActivityList,
    DwdLoader,
  },
  metaInfo: function () {
    return {
      title: `User ${this.username}`,
    };
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
    loadUser: async function () {
      if (!this.username) {
        return;
      }
      this.user = null;
      let loader = this.$refs.loader;
      let res = await this.$http.get('/api/user/' + this.username, { loader });
      this.user = res.data;
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
