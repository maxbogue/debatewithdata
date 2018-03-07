<template>
<div>
  <h1>Activity</h1>
  <dwd-loader ref="loader" />
  <ul v-if="activity" :class="$style.activity" class="mono">
    <li v-for="item in activity" :key="item.timestamp + item.id">
      <span>{{ item.timestamp | timestamp }}</span>
      <strong>{{ item.username }}</strong>
      <span>{{ item.action }}</span>
      <strong><a :href="'/' + item.type + '/' + item.id"
                 >{{ item.type }} {{ item.id }}</a></strong>
    </li>
  </ul>
</div>
</template>

<script>
import axios from 'axios';

import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    activity: null,
  }),
  mounted: function () {
    if (!this.activity) {
      let loader = this.$refs.loader;
      axios.get('/api/activity', { loader }).then((res) => {
        this.activity = res.data;
      });
    }
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.activity {
  width: 100%;
  padding: 0;
  font-size: 0.75em;
  list-style: none;

  a:hover {
    text-decoration: underline;
  }
}
</style>
