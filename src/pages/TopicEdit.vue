<template>
<div>
  <template v-if="!needsData">
    <div class="topic">
      <topic-rev-content class="bubble click"
                         :prev="topic"
                         :curr="newTopicPartial"
                         @click.native="showModal = true" />
      <div class="info">
        <span class="id mono">{{ id || newId || 'new' }}</span>
      </div>
    </div>
    <topic-edit-modal :show.sync="showModal"
                      :topic.sync="newTopicPartial"
                      :old-id="id" />
    <h3>Sub-Topics</h3>
    <div class="topic">
      <div class="bubble click"
           @click="showSubTopicModal = true">
        <strong>Add or link a sub-topic.</strong>
      </div>
    </div>
    <topic-link-modal :show.sync="showSubTopicModal"
                      @link="addSubTopicId"
                      @add="addNewSubTopic" />
    <div v-for="(subTopic, i) in newSubTopics"
         class="topic"
         :key="subTopic.id">
      <div class="bubble">
        <div class="ins">{{ subTopic.title }}</div>
      </div>
      <div class="info">
        <span class="id mono">{{ subTopic.id }}</span>
        <span class="delete click fas fa-trash-alt"
              @click="newSubTopics.splice(i, 1)"></span>
      </div>
    </div>
    <div v-for="[subTopic, diffClass] in linkedSubTopics"
         class="topic"
         :key="subTopic.id">
      <div class="bubble">
        <div :class="diffClass">{{ subTopic.title }}</div>
      </div>
      <div class="info">
        <span class="id mono">{{ subTopic.id }}</span>
        <span class="delete click fas fa-trash-alt"
              @click="toggleDeleted(subTopicIds, subTopic.id)"></span>
      </div>
    </div>
    <h3>Key Claims</h3>
    <div class="claim">
      <div class="bubble click"
           @click="showClaimModal = true">
        <strong>Add or link a claim.</strong>
      </div>
    </div>
    <claim-link-modal :show.sync="showClaimModal"
                      @link="addClaimId"
                      @add="addNewClaim" />
    <div v-for="(claim, i) in newClaims"
         class="claim"
         :key="claim.id">
      <div class="bubble">
        <claim-content class="ins" :claim="claim" />
      </div>
      <div class="info">
        <span class="id mono">new</span>
        <span class="delete click fas fa-trash-alt"
              @click="newClaims.splice(i, 1)"></span>
      </div>
    </div>
    <div v-for="[claim, diffClass] in linkedClaims"
         class="claim"
         :key="claim.id">
      <div class="bubble">
        <claim-content :class="diffClass" :claim="claim" />
      </div>
      <div class="info">
        <span class="id mono">{{ claim.id }}</span>
        <span class="delete click fas fa-trash-alt"
              @click="toggleDeleted(claimIds, claim.id)"></span>
      </div>
    </div>
    <div v-if="topic" class="block no-pad center">
      <delete-button noun="Topic" @delete="remove" />
    </div>
    <fixed-bottom class="center pink">
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="button"
              class="dwd-btn pink-dark"
              @click="submit">Submit</button>
    </fixed-bottom>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import ClaimContent from '../ClaimContent.vue';
import ClaimLinkModal from '../ClaimLinkModal.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import TopicEditModal from '../TopicEditModal.vue';
import TopicLinkModal from '../TopicLinkModal.vue';
import TopicRevContent from '../TopicRevContent.vue';
import { diffIdLists, pipe, stableRandom, starCount, starred } from '../utils';

export default {
  components: {
    ClaimContent,
    ClaimLinkModal,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    TopicEditModal,
    TopicLinkModal,
    TopicRevContent,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    newTopicPartial: null,
    subTopicIds: [],
    newSubTopics: [],
    claimIds: [],
    newClaims: [],
    showModal: false,
    showSubTopicModal: false,
    showClaimModal: false,
  }),
  computed: {
    newId: function () {
      return this.newTopicPartial && this.newTopicPartial.id;
    },
    topic: function () {
      return this.lookupTopic(this.id);
    },
    linkedSubTopics: function () {
      let oldSubTopicIds = this.topic ? this.topic.subTopicIds : [];
      return diffIdLists(this.subTopicIds, oldSubTopicIds,
          this.$store.state.topics);
    },
    linkedClaims: function () {
      let oldClaimIds = this.topic ? this.topic.claimIds : [];
      return diffIdLists(this.claimIds, oldClaimIds,
          this.$store.state.claims);
    },
    needsData: function () {
      return this.id && !this.topic;
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
    addSubTopicId: function (subTopicId) {
      if (!this.subTopicIds.includes(subTopicId)) {
        this.subTopicIds.splice(0, 0, subTopicId);
      }
    },
    addNewSubTopic: function (newSubTopic) {
      this.newSubTopics.splice(0, 0, newSubTopic);
    },
    addClaimId: function (claimId) {
      if (!this.claimIds.includes(claimId)) {
        this.claimIds.splice(0, 0, claimId);
      }
    },
    addNewClaim: function (newClaim) {
      this.newClaims.splice(0, 0, newClaim);
    },
    toggleDeleted: function (ids, id) {
      let i = ids.indexOf(id);
      if (i < 0) {
        ids.push(id);
      } else {
        ids.splice(i, 1);
      }
    },
    submit: function () {
      let action = 'addTopic';
      let payload = {
        topic: {
          ...this.newTopicPartial,
          subTopicIds: filter(this.subTopicIds, this.lookupTopic),
          claimIds: filter(this.claimIds, this.lookupClaim),
          newSubTopics: this.newSubTopics,
          newClaims: this.newClaims,
        },
      };
      if (this.topic) {
        action = 'updateTopic';
        payload.id = this.topic.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.topicUrl(id));
      });
    },
    remove: function () {
      this.$store.dispatch('removeTopic', {
        id: this.topic.id,
      }).then(() => {
        this.$router.push('/topics');
      });
    },
    cancel: function () {
      this.$router.push(this.topic ? this.topicUrl(this.topic.id) : '/topics');
    },
    initialize: function () {
      let seed = this.seed || this.topic;
      if (seed && !seed.deleted) {
        this.newTopicPartial = {
          title: seed.title || '',
          text: seed.text || '',
        };

        let topicStarred = pipe(this.lookupTopic, starred);
        let topicStarCount = pipe(this.lookupTopic, starCount);
        this.subTopicIds = sortBy(seed.subTopicIds,
            [topicStarred, topicStarCount, stableRandom]);

        let claimStarred = pipe(this.lookupClaim, starred);
        let claimStarCount = pipe(this.lookupClaim, starCount);
        this.claimIds = sortBy(seed.claimIds,
            [claimStarred, claimStarCount, stableRandom]);
      } else {
        this.showModal = true;
      }
    },
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getTopic', {
          id: this.id,
          loader: this.$refs.loader,
        }).then(() => {
          this.initialize();
        });
      } else {
        this.initialize();
      }
    },
  },
};
</script>
