<template>
<div>
  <h1>Recent Activity</h1>
  <dwd-loader ref="loader" />
  <activity-list v-if="activity" :activity="activity" />
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
  data: () => ({
    activity: null,
  }),
  mounted: function () {
    if (!this.activity) {
      let loader = this.$refs.loader;
      axios.get('/api/activity', { loader }).then((res) => {
        this.activity = res.data.activity;
      });
    }
  },
};
</script>
