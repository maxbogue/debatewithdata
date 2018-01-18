<template>
<div>
  <template v-if="topic">
    <div class="topic t1">
      <div class="bubble click"
           @click="showDrawer = !showDrawer">
        <h2>{{ topic.title }}</h2>
        <p>{{ topic.text }}</p>
      </div>
      <drawer :show="showDrawer">
        <div class="info">
          <span class="id mono">{{ id }}</span>
          <dwd-star :star="topic.star"
                    :url="'/api' + topicUrl(id)"></dwd-star>
          <router-link v-if="$store.state.user"
                       :to="topicUrl(id) + '/edit'"
                       class="glyphicon glyphicon-pencil click"
                       aria-hidden="true"></router-link>
          <comment-icon @click.native="showComments = !showComments"
                        :count="topic.commentCount"></comment-icon>
        </div>
        <dwd-comments v-if="showComments"
                      :url="'/api/topic/' + id"></dwd-comments>
      </drawer>
    </div>
    <template v-if="subTopics.length > 0">
      <h3>Sub-Topics</h3>
      <router-link v-for="subTopic in subTopics"
                   class="topic block"
                   :to="topicUrl(subTopic.id)"
                   :key="subTopic.id">
        {{ subTopic.title }}
      </router-link>
    </template>
    <template v-if="claims.length > 0">
      <h3>Key Claims</h3>
      <router-link v-for="claim in claims"
                   class="claim block"
                   :to="claimUrl(claim.id)"
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
import CommentIcon from '../CommentIcon.vue';
import Drawer from '../Drawer.vue';
import DwdComments from '../DwdComments.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdStar from '../DwdStar.vue';
import TopicInput from '../TopicInput.vue';
import { sortByStars } from '../utils';

export default {
  components: {
    ClaimContent,
    CommentIcon,
    Drawer,
    DwdComments,
    DwdLoader,
    DwdStar,
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
      if (!this.topic) {
        return [];
      }
      return sortByStars(map(this.topic.subTopicIds, this.lookupTopic));
    },
    claims: function () {
      if (!this.topic) {
        return [];
      }
      return sortByStars(map(this.topic.claimIds, this.lookupClaim));
    },
  },
  methods: {
    checkLoaded: function () {
      if (!this.topic) {
        this.$store.dispatch('getTopic', {
          id: this.id,
          loader: this.$refs.loader,
        });
      }
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
};
</script>
