<template>
  <div>
    <topic-rev-content class="topic block" :curr="curr" :prev="prev" />
    <template v-if="subTopics.length > 0">
      <h3>Sub-Topics</h3>
      <router-link
        v-for="[subTopic, diffClass] in subTopics"
        class="topic block"
        :to="topicUrl(subTopic.id, trail)"
        :key="subTopic.id"
      >
        <div :class="diffClass">{{ subTopic.title }}</div>
      </router-link>
    </template>
    <template v-if="claims.length > 0">
      <h3>Key Claims</h3>
      <router-link
        v-for="[claim, diffClass] in claims"
        class="claim block"
        :to="claimUrl(claim.id, trail)"
        :key="claim.id"
      >
        <claim-content :class="diffClass" :claim="claim" />
      </router-link>
    </template>
  </div>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import TopicRevContent from './TopicRevContent.vue';
import { diffIdLists } from '@/utils';

export default {
  components: {
    ClaimContent,
    TopicRevContent,
  },
  props: {
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
    trail: { type: Array, required: true },
  },
  computed: {
    currHasContent() {
      return !this.curr.deleted;
    },
    prevHasContent() {
      return this.prev && !this.prev.deleted;
    },
    subTopics() {
      const currSubTopicIds = this.currHasContent ? this.curr.subTopicIds : [];
      const prevSubTopicIds = this.prevHasContent ? this.prev.subTopicIds : [];
      return diffIdLists(
        currSubTopicIds,
        prevSubTopicIds,
        this.$store.state.topics
      );
    },
    claims() {
      const currClaimIds = this.currHasContent ? this.curr.claimIds : [];
      const prevClaimIds = this.prevHasContent ? this.prev.claimIds : [];
      return diffIdLists(currClaimIds, prevClaimIds, this.$store.state.claims);
    },
  },
};
</script>
