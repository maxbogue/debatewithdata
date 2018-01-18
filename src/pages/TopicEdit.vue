<template>
<div>
  <form v-if="!needsData" @submit.prevent="submit">
    <div class="topic t1">
      <topic-rev-content class="bubble click"
                         :prev="topic"
                         :curr="newTopicPartial"
                         @click.native="editThisTopic" />
      <div class="info">
        <span class="id mono">{{ id || 'new' }}</span>
      </div>
    </div>
    <topic-edit-modal :show.sync="showModal"
                      :topic="modalTopic"
                      @update="(v) => modalCallback(v)" />
    <h3>Sub-Topics</h3>
    <topic-input v-for="(subTopicId, i) in subTopicIds"
                 class="topic block"
                 :id="subTopicId"
                 @update="(newId) => updateSubTopicId(i, newId)"
                 :key="'topic-' + i" />
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
      <button type="submit" class="dwd-btn blue-dark">Submit</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
    </fixed-bottom>
  </form>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import assign from 'lodash/assign';
import clone from 'lodash/clone';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import ClaimInput from '../ClaimInput.vue';
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FixedBottom from '../FixedBottom.vue';
import TopicEditModal from '../TopicEditModal.vue';
import TopicRevContent from '../TopicRevContent.vue';
import TopicInput from '../TopicInput.vue';
import { pipe, stableRandom, starCount, starred } from '../utils';

export default {
  components: {
    ClaimInput,
    DeleteButton,
    DwdLoader,
    FixedBottom,
    TopicEditModal,
    TopicRevContent,
    TopicInput,
  },
  data: () => ({
    newTopicPartial: undefined,
    subTopicIds: [],
    claimIds: [],
    showModal: false,
    modalTopic: null,
    modalCallback: null,
  }),
  computed: {
    id: function () {
      if (this.routeId) {
        return this.routeId;
      } else if (this.newTopicPartial) {
        return this.newTopicPartial.id;
      }
      return null;
    },
    routeId: function () {
      return this.$route.params.id;
    },
    topic: function () {
      return this.$store.state.topics[this.routeId] || undefined;
    },
    needsData: function () {
      return this.routeId && !this.topic;
    },
  },
  methods: {
    editTopic: function (topic, callback) {
      this.modalTopic = topic;
      this.modalCallback = callback;
      this.showModal = true;
    },
    editThisTopic: function () {
      this.editTopic(this.newTopicPartial, (t) => this.newTopicPartial = t);
    },
    updateSubTopicId: function (i, subTopicId) {
      this.$set(this.subTopicIds, i, subTopicId);
      if (i === this.subTopicIds.length - 1) {
        this.subTopicIds.push('');
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
        topic: assign(clone(this.newTopicPartial), {
          subTopicIds: filter(this.subTopicIds, this.lookupTopic),
          claimIds: filter(this.claimIds, this.lookupClaim),
        }),
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
        this.newTopicPartial = this.topic;

        let topicStarred = pipe(this.lookupTopic, starred);
        let topicStarCount = pipe(this.lookupTopic, starCount);
        this.subTopicIds = sortBy(this.topic.subTopicIds,
            [topicStarred, topicStarCount, stableRandom]);

        let claimStarred = pipe(this.lookupClaim, starred);
        let claimStarCount = pipe(this.lookupClaim, starCount);
        this.claimIds = sortBy(this.topic.claimIds,
            [claimStarred, claimStarCount, stableRandom]);
      } else {
        this.editThisTopic();
      }

      // Append an empty input for new sub-topics.
      this.subTopicIds.push('');
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
