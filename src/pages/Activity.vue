<template>
<div class="narrow">
  <h1>Recent Activity</h1>
  <activity-list v-if="activity" :activity="activity" />
</div>
</template>

<script>
import ActivityList from '../components/ActivityList.vue';

export default {
  components: {
    ActivityList,
  },
  metaInfo: {
    title: 'Activity',
  },
  data: () => ({
    activity: null,
  }),
  async mounted() {
    if (!this.activity) {
      const data = await this.$store.dispatch('getActivity');
      this.activity = data.activity;
    }
  },
};
</script>
