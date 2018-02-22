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
import ClaimContent from './ClaimContent.vue';
import TopicRevContent from './TopicRevContent.vue';
import { diffIdLists } from './utils';

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
      return diffIdLists(currSubTopicIds, prevSubTopicIds, this.data.topics);
    },
    claims: function () {
      let currClaimIds = this.curr ? this.curr.claimIds : [];
      let prevClaimIds = this.prev ? this.prev.claimIds : [];
      return diffIdLists(currClaimIds, prevClaimIds, this.data.claims);
    },
  },
};
</script>
