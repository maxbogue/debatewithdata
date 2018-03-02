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
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
  },
  computed: {
    currHasContent: function () {
      return !this.curr.deleted;
    },
    prevHasContent: function () {
      return this.prev && !this.prev.deleted;
    },
    subTopics: function () {
      let currSubTopicIds = this.currHasContent ? this.curr.subTopicIds : [];
      let prevSubTopicIds = this.prevHasContent ? this.prev.subTopicIds : [];
      return diffIdLists(currSubTopicIds, prevSubTopicIds,
          this.$store.state.topics);
    },
    claims: function () {
      let currClaimIds = this.currHasContent ? this.curr.claimIds : [];
      let prevClaimIds = this.prevHasContent ? this.prev.claimIds : [];
      return diffIdLists(currClaimIds, prevClaimIds, this.$store.state.claims);
    },
  },
};
</script>
