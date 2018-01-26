<template>
<div>
  <div class="block no-pad center">
    <h3 class="mono">{{ curr.id }}</h3>
    <div>
        <strong>by</strong> <span>{{ curr.username }}</span>
    </div>
    <div><strong>created</strong> {{ curr.createdAt | timestamp }}</div>
  </div>
  <div class="block no-pad center" :class="$style.nav">
    <router-link v-if="prev"
                 :to="prevUrl"
                 class="dwd-btn grey">Prev</router-link>
    <router-link :to="url + '/history'"
                 class="dwd-btn grey">History</router-link>
    <router-link v-if="next"
                 :to="nextUrl"
                 class="dwd-btn grey">Next</router-link>
  </div>
  <topic-rev-content class="topic block" :curr="curr" :prev="prev" />
  <template v-if="subTopics.length > 0">
    <h3>Sub-Topics</h3>
    <router-link v-for="[subTopic, diffClass] in subTopics"
                 class="topic block"
                 :to="topicUrl(subTopic.id)"
                 :key="subTopic.id">
      <div :class="diffClass">{{ subTopic.title }}</div>
    </router-link>
  </template>
  <template v-if="claims.length > 0">
    <h3>Key Claims</h3>
    <router-link v-for="[claim, diffClass] in claims"
                 class="claim block"
                 :to="claimUrl(claim.id)"
                 :key="claim.id">
      <claim-content :class="diffClass"
                     :claim="claim" />
    </router-link>
  </template>
</div>
</template>

<script>
import dateFormat from 'dateformat';
import filter from 'lodash/filter';
import map from 'lodash/map';
import partition from 'lodash/partition';

import ClaimContent from './ClaimContent.vue';
import TopicRevContent from './TopicRevContent.vue';

export default {
  components: {
    ClaimContent,
    TopicRevContent,
  },
  props: {
    topicId: {
      type: String,
      required: true,
    },
    revId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    revIndex: function () {
      return this.data.topicRevs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.data.topicRevs[this.revIndex];
    },
    prev: function () {
      return this.data.topicRevs[this.revIndex + 1];
    },
    next: function () {
      return this.data.topicRevs[this.revIndex - 1];
    },
    url: function () {
      return this.topicUrl(this.topicId);
    },
    prevUrl: function () {
      return this.url + '/rev/' + this.prev.id;
    },
    nextUrl: function () {
      return this.url + '/rev/' + this.next.id;
    },
    subTopics: function () {
      let currSubTopicIds = this.curr ? this.curr.subTopicIds : [];
      let prevSubTopicIds = this.prev ? this.prev.subTopicIds : [];

      let inPrev = (id) => prevSubTopicIds.includes(id);
      let notInCurr = (id) => !currSubTopicIds.includes(id);

      let [inBoth, added] = partition(currSubTopicIds, inPrev);
      let removed = filter(prevSubTopicIds, notInCurr);

      added.sort();
      removed.sort();
      inBoth.sort();

      let zipWith = (ids, v) => map(ids, (id) => [this.data.topics[id], v]);
      added = zipWith(added, 'ins');
      removed = zipWith(removed, 'del');
      inBoth = zipWith(inBoth, '');

      return added.concat(removed, inBoth);
    },
    claims: function () {
      let currClaimIds = this.curr ? this.curr.claimIds : [];
      let prevClaimIds = this.prev ? this.prev.claimIds : [];

      let inPrev = (id) => prevClaimIds.includes(id);
      let notInCurr = (id) => !currClaimIds.includes(id);

      let [inBoth, added] = partition(currClaimIds, inPrev);
      let removed = filter(prevClaimIds, notInCurr);

      added.sort();
      removed.sort();
      inBoth.sort();

      let zipWith = (ids, v) => map(ids, (id) => [this.data.claims[id], v]);
      added = zipWith(added, 'ins');
      removed = zipWith(removed, 'del');
      inBoth = zipWith(inBoth, '');

      return added.concat(removed, inBoth);
    },
  },
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.nav
  align-items: center
  display: flex
  justify-content: center
  padding: 8px 0 0 0

  a
    width: 7em;

    &:not(:first-child)
      margin-left: $accent-border-width
</style>
