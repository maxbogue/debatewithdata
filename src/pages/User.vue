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
import ActivityList from '@/components/ActivityList.vue';
import DwdLoader from '@/components/DwdLoader.vue';

export default {
  components: {
    ActivityList,
    DwdLoader,
  },
  metaInfo() {
    return {
      title: this.username,
    };
  },
  props: {
    username: { type: String, required: true },
  },
  data: () => ({
    user: null,
  }),
  watch: {
    username() {
      this.loadUser();
    },
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    async loadUser() {
      if (!this.username) {
        return;
      }
      this.user = null;
      this.user = await this.$store.dispatch('getUser', {
        username: this.username,
        loader: this.$refs.loader,
      });
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.timestamp {
  color: $text-dark-accent;
}
</style>
