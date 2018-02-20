<template>
<div class="narrow">
  <h1>Activity</h1>
  <dwd-loader ref="loader"></dwd-loader>
  <table v-if="activity" :class="$style.activity" class="mono">
    <tr v-for="item in activity" :key="item.timestamp + item.id">
      <td :class="$style.timestamp">{{ item.timestamp | timestamp }}</td>
      <td :class="$style.username">{{ item.username }}</td>
      <td>{{ item.action }}</td>
      <td>
        <a :href="'/' + item.type + '/' + item.id"
           :class="$style.link">{{ item.type }} {{ item.id }}</a>
      </td>
    </tr>
  </table>
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';

import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  filters: {
    timestamp: function (seconds) {
      let date = new Date(seconds * 1000);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
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

<style lang="sass" module>
@import "../style/constants"

.activity
  width: 100%

  td
    padding: 0 10px

    &:first-child
      padding-left: 0

.timestamp
  color: $text-dark-accent

.username, .link
  font-weight: $font-weight-bold
</style>
