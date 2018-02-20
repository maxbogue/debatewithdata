<template>
<div>
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
    topicId: { type: String, required: true },
    revId: { type: String, required: true },
    data: { type: Object, required: true },
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
};
</script>
