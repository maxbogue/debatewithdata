<template>
<div :class="{ narrow: data && !revId }">
  <template v-if="data && !revId">
    <h3 class="center">
      History for
      <router-link :to="topicUrl(topicId)"
                   class="mono">{{ topicId }}</router-link>
    </h3>
    <ul class="mono" :class="$style.revs">
      <li v-for="rev in data.topicRevs" :key="rev.id">
        <router-link :to="revUrl(rev)">{{ rev.id }}</router-link>
        <span :class="$style.username">{{ rev.username }}</span>
        <span>{{ rev.createdAt | timestamp }}</span>
      </li>
    </ul>
  </template>
  <topic-rev v-if="data && revId"
             :topicId="topicId"
             :revId="revId"
             :data="data" />
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';
import forOwn from 'lodash/forOwn';
import isPlainObject from 'lodash/isPlainObject';

import TopicRev from '../TopicRev.vue';
import DwdLoader from '../DwdLoader.vue';

// Items in data maps are keyed by their IDs but don't have it also set on
// themselves to save bytes on the wire. This function fills them in.
function addIdsToData(data) {
  forOwn(data, (typeMap) => {
    if (!isPlainObject(typeMap)) {
      return;
    }
    forOwn(typeMap, (item, itemId) => {
      item.id = itemId;
    });
  });
}

export default {
  components: {
    TopicRev,
    DwdLoader,
  },
  data: () => ({
    data: null,
  }),
  computed: {
    topicId: function () {
      return this.$route.params.id;
    },
    revId: function () {
      return this.$route.params.revId;
    },
  },
  methods: {
    revUrl: function (rev) {
      return this.topicUrl(this.topicId) + '/rev/' + rev.id;
    },
    loadData: function () {
      this.data = null;
      axios.get('/api/topic/' + this.topicId + '/rev', {
        loader: this.$refs.loader,
      }).then((res) => {
        addIdsToData(res.data);
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
@import "../style/constants"

.revs
  margin: 20px auto
  padding: 0

  li
    display: flex
    list-style: none
    padding: 6px 8px
    text-align: center

    .username
      flex: 1

  li:nth-child(even)
    background-color: $pink-primary

  li:nth-child(odd)
    background-color: $pink-accent
</style>
