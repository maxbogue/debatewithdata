<template>
<div :class="{ narrow: data && !revId }">
  <template v-if="data && !revId">
    <h3 class="center">
      History for
      <router-link :to="url"
                   class="mono">{{ itemId }}</router-link>
    </h3>
    <ul class="mono" :class="$style.revs">
      <li v-for="rev in revs" :class="revClass" :key="rev.id">
        <router-link :to="revUrl(rev)">{{ rev.id }}</router-link>
        <span :class="$style.username">{{ rev.username }}</span>
        <span>{{ rev.createdAt | timestamp }}</span>
      </li>
    </ul>
  </template>
  <template v-if="data && revId">
    <rev-nav :item-type="itemType"
             :item-id="itemId"
             :rev-id="revId"
             :revs="revs" />
    <topic-rev v-if="itemType === 'topic'"
               :topic-id="itemId"
               :rev-id="revId"
               :data="data" />
    <claim-rev v-else-if="itemType === 'claim'"
               :claim-id="itemId"
               :rev-id="revId"
               :data="data" />
    <source-rev v-else-if="itemType === 'source'"
               :source-id="itemId"
               :rev-id="revId"
               :data="data" />
  </template>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';
import forOwn from 'lodash/forOwn';
import isPlainObject from 'lodash/isPlainObject';

import ClaimRev from '../ClaimRev.vue';
import RevNav from '../RevNav.vue';
import SourceRev from '../SourceRev.vue';
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
    ClaimRev,
    RevNav,
    SourceRev,
    TopicRev,
    DwdLoader,
  },
  data: () => ({
    data: null,
  }),
  computed: {
    itemType: function () {
      return this.$route.params.type;
    },
    itemId: function () {
      return this.$route.params.id;
    },
    revId: function () {
      return this.$route.params.revId;
    },
    revs: function () {
      if (!this.data) {
        return [];
      }
      switch (this.itemType) {
      case 'topic':
        return this.data.topicRevs;
      case 'claim':
        return this.data.claimRevs;
      case 'source':
        return this.data.sourceRevs;
      }
      return [];
    },
    revClass: function () {
      switch (this.itemType) {
      case 'topic':
        return this.$style.topicRev;
      case 'claim':
        return this.$style.claimRev;
      case 'source':
        return this.$style.sourceRev;
      }
      return '';
    },
    url: function () {
      return '/' + this.itemType + '/' + this.itemId;
    },
  },
  methods: {
    revUrl: function (rev) {
      return '/' + this.itemType + '/' + this.itemId + '/rev/' + rev.id;
    },
    loadData: function () {
      this.data = null;
      axios.get('/api/' + this.itemType + '/' + this.itemId + '/rev', {
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
    &.topicRev
      background-color: $pink-primary
    &.claimRev
      background-color: $blue-primary
    &.sourceRev
      background-color: $green-primary

  li:nth-child(odd)
    &.topicRev
      background-color: $pink-accent
    &.claimRev
      background-color: $blue-accent
    &.sourceRev
      background-color: $green-accent
</style>
