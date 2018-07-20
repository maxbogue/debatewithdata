<template>
<div class="narrow">
  <h1>Recent Activity</h1>
  <dwd-loader ref="loader" />
  <activity-list v-if="activity" :activity="activity" />
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
  data: () => ({
    activity: null,
  }),
  mounted: async function () {
    if (!this.activity) {
      let loader = this.$refs.loader;
      let res = await this.$http.get('/api/activity', { loader });
      this.activity = res.data.activity;
    }
  },
};
</script>
