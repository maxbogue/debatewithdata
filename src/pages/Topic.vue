<template>
<div>
  <dwd-trail :ids="trail" />
  <template v-if="topic">
    <div class="topic t1">
      <topic-content class="bubble click"
                     :topic="topic"
                     @click.native="showDrawer = !showDrawer" />
      <dwd-drawer :show="showDrawer">
        <div class="info">
          <span class="id mono">{{ id }}</span>
          <icon-star :star="topic.star" :url="'/api' + topicUrl(id)" />
          <icon-history :url="topicUrl(id)" />
          <icon-edit v-if="$store.state.user" :url="topicUrl(id)" />
          <icon-comment @click.native="showComments = !showComments"
                        :count="topic.commentCount" />
        </div>
        <dwd-comments :url="'/api/topic/' + id"
                      :show="showComments"
                      :hint="showDrawer" />
      </dwd-drawer>
    </div>
    <template v-if="subTopics.length > 0">
      <h3>Sub-Topics</h3>
      <router-link v-for="subTopic in subTopics"
                   class="topic block"
                   :to="topicUrl(subTopic.id, trail.concat(id))"
                   :key="subTopic.id">
        {{ subTopic.title }}
      </router-link>
    </template>
    <template v-if="claims.length > 0">
      <h3>Key Claims</h3>
      <router-link v-for="claim in claims"
                   class="claim block"
                   :to="claimUrl(claim.id, trail.concat(id))"
                   :key="claim.id">
          <claim-content :claim="claim" />
      </router-link>
    </template>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import map from 'lodash/map';

import ClaimContent from '../ClaimContent.vue';
import DwdComments from '../DwdComments.vue';
import DwdDrawer from '../DwdDrawer.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import IconComment from '../IconComment.vue';
import IconEdit from '../IconEdit.vue';
import IconHistory from '../IconHistory.vue';
import IconStar from '../IconStar.vue';
import TopicContent from '../TopicContent.vue';
import TopicInput from '../TopicInput.vue';
import { sortByStars } from '../utils';

export default {
  components: {
    ClaimContent,
    DwdComments,
    DwdDrawer,
    DwdLoader,
    DwdTrail,
    IconComment,
    IconEdit,
    IconHistory,
    IconStar,
    TopicContent,
    TopicInput,
  },
  data: () => ({
    showComments: false,
    showDrawer: false,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    topic: function () {
      return this.$store.state.topics[this.id] || null;
    },
    subTopics: function () {
      if (!this.topic || this.topic.deleted) {
        return [];
      }
      return sortByStars(map(this.topic.subTopicIds, this.lookupTopic));
    },
    claims: function () {
      if (!this.topic || this.topic.deleted) {
        return [];
      }
      return sortByStars(map(this.topic.claimIds, this.lookupClaim));
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
  methods: {
    checkLoaded: function () {
      if (!this.topic) {
        this.$store.dispatch('getTopic', {
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
};
</script>
