<template>
<div>
  <form v-if="!needsData" @submit.prevent="submit">
    <topic-rev-content class="topic block click"
                       :prev="topic"
                       :curr="newTopicPartial"
                       @click.native="showModal = true" />
    <topic-edit-modal :show.sync="showModal"
                      :topic.sync="newTopicPartial"
                      :oldId="id" />
    <h3>Sub-Topics</h3>
    <div class="topic">
      <div class="bubble click"
           @click="showSubTopicModal = true">
        <strong>Add new sub-topic.</strong>
      </div>
    </div>
    <topic-link-modal :show.sync="showSubTopicModal"
                      @update="addSubTopicId" />
    <div v-for="(subTopic, i) in subTopics"
         class="topic"
         :key="subTopic.id">
      <topic-content class="bubble" :topic="subTopic" />
      <div class="info">
        <span class="id mono">{{ subTopic.id }}</span>
        <span class="delete click glyphicon glyphicon-trash"
              aria-hidden="true"
              @click="subTopicIds.splice(i, 1)"></span>
      </div>
    </div>
    <h3>Key Claims</h3>
    <claim-input v-for="(claimId, i) in claimIds"
                 class="claim block"
                 :id="claimId"
                 @update="(newId) => updateClaimId(i, newId)"
                 :key="'claim-' + i" />
    <div v-if="topic" class="block no-pad center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <fixed-bottom class="center pink">
      <button type="submit" class="dwd-btn pink-dark">Submit</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
    </fixed-bottom>
  </form>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import filter from 'lodash/filter';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import ClaimInput from '../ClaimInput.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import TopicContent from '../TopicContent.vue';
import TopicEditModal from '../TopicEditModal.vue';
import TopicLinkModal from '../TopicLinkModal.vue';
import TopicRevContent from '../TopicRevContent.vue';
import { pipe, stableRandom, starCount, starred } from '../utils';

export default {
  components: {
    ClaimInput,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    TopicContent,
    TopicEditModal,
    TopicLinkModal,
    TopicRevContent,
  },
  data: () => ({
    newTopicPartial: undefined,
    subTopicIds: [],
    claimIds: [],
    showModal: false,
    showSubTopicModal: false,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    topic: function () {
      return this.lookupTopic(this.id);
    },
    subTopics: function () {
      return map(this.subTopicIds, this.lookupTopic);
    },
    needsData: function () {
      return this.id && !this.topic;
    },
  },
  methods: {
    addSubTopicId: function (subTopicId) {
      if (!this.subTopicIds.includes(subTopicId)) {
        this.subTopicIds.splice(0, 0, subTopicId);
      }
    },
    updateClaimId: function (i, claimId) {
      this.$set(this.claimIds, i, claimId);
      if (i === this.claimIds.length - 1) {
        this.claimIds.push('');
      }
    },
    submit: function () {
      let action = 'addTopic';
      let payload = {
        topic: {
          ...this.newTopicPartial,
          subTopicIds: filter(this.subTopicIds, this.lookupTopic),
          claimIds: filter(this.claimIds, this.lookupClaim),
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
      if (this.topic) {
        this.newTopicPartial = {
          title: this.topic.title || '',
          text: this.topic.text || '',
        };

        let topicStarred = pipe(this.lookupTopic, starred);
        let topicStarCount = pipe(this.lookupTopic, starCount);
        this.subTopicIds = sortBy(this.topic.subTopicIds,
            [topicStarred, topicStarCount, stableRandom]);

        let claimStarred = pipe(this.lookupClaim, starred);
        let claimStarCount = pipe(this.lookupClaim, starCount);
        this.claimIds = sortBy(this.topic.claimIds,
            [claimStarred, claimStarCount, stableRandom]);
      } else {
        this.showModal = true;
      }

      // Append an empty input for new claims.
      this.claimIds.push('');
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
  watch: {
    topic: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
};
</script>
