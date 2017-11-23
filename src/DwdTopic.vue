<template>
<div>
  <div v-if="topic" class="row gutter-16">
    <div class="col-sm-12">
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
      <h3>Key Claims</h3>
      <router-link v-for="claim in claims"
                   class="claim block"
                   :to="claimUrl(claim.id)"
                   :key="claim.id">
          <claim-content :claim="claim"></claim-content>
      </router-link>
    </div>
  </div>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import map from 'lodash/map';

import ClaimContent from './ClaimContent.vue';
import CommentIcon from './CommentIcon.vue';
import Drawer from './Drawer.vue';
import DwdComments from './DwdComments.vue';
import DwdLoader from './DwdLoader.vue';
import DwdStar from './DwdStar.vue';
import { sortByStars } from './utils';

export default {
  components: {
    ClaimContent,
    CommentIcon,
    Drawer,
    DwdComments,
    DwdLoader,
    DwdStar,
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
