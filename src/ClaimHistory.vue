<template>
<div>
  <template v-if="data && !revId">
    <h3 class="center">
      History for
      <router-link :to="claimUrl(claimId)"
                  class="mono">{{ claimId }}</router-link>
    </h3>
    <ul class="mono" :class="$style.revs">
      <li v-for="rev in data.claimRevs" :key="rev.id">
        <router-link :to="revUrl(rev)">{{ rev.id }}</router-link>
        <span :class="$style.username">{{ rev.username }}</span>
        <span>{{ rev.createdAt | timestamp }}</span>
      </li>
    </ul>
  </template>
  <claim-rev v-if="data && revId"
             :claimId="claimId"
             :revId="revId"
             :data="data" />
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';

import ClaimRev from './ClaimRev.vue';
import DwdLoader from './DwdLoader.vue';

export default {
  components: {
    ClaimRev,
    DwdLoader,
  },
  data: () => ({
    data: null,
  }),
  computed: {
    claimId: function () {
      return this.$route.params.id;
    },
    revId: function () {
      return this.$route.params.revId;
    },
  },
  methods: {
    revUrl: function (rev) {
      return this.claimUrl(this.claimId) + '/rev/' + rev.id;
    },
    loadData: function () {
      this.data = null;
      axios.get('/api/claim/' + this.claimId + '/rev', {
        loader: this.$refs.loader,
      }).then((res) => {
        this.data = res.data;
      });
    },
  },
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
  watch: {
    id: function () {
      this.loadData();
    },
  },
  mounted: function () {
    this.loadData();
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.revs
  margin: 20px auto
  padding: 0
  width: 600px

  li
    display: flex
    list-style: none
    padding: 6px 8px
    text-align: center

    .username
      flex: 1

  li:nth-child(even)
    background-color: $blue-primary

  li:nth-child(odd)
    background-color: $blue-accent
</style>
