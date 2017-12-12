<template>
<div>
  <form v-if="!needsData" @submit.prevent="submit">
    <div class="topic t1">
      <div class="bubble">
        <label v-if="!id" for="id" class="hint">
          The ID shows up in the URL.
        </label>
        <textarea v-if="!id"
                  id="id"
                  class="mono"
                  rows="1"
                  autocomplete="off"
                  placeholder="id"
                  v-model="tempId"
                  v-auto-resize></textarea>
        <label for="title" class="hint">
          The title of this topic.
        </label>
        <textarea id="title"
                  rows="1"
                  autocomplete="off"
                  placeholder="title"
                  v-model="title"
                  v-auto-resize></textarea>
        <label for="text" class="hint">
          Describe this topic.
        </label>
        <textarea id="text"
                  rows="1"
                  autocomplete="off"
                  placeholder="description"
                  v-model="text"
                  v-auto-resize></textarea>
      </div>
      <div v-if="text" class="info">
        <span class="id mono">{{ id || 'new' }}</span>
      </div>
    </div>
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
    <div v-if="id" class="block no-pad center">
      <delete-button noun="Claim" @delete="remove" />
    </div>
    <div :class="$style.fixedBottom" class="center blue">
      <button type="submit" class="btn btn-primary">Submit</button>
      <button type="button"
              class="btn btn-default"
              @click="cancel">Cancel</button>
    </div>
  </form>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import ClaimInput from './ClaimInput.vue';
import DeleteButton from './DeleteButton.vue';
import DwdLoader from './DwdLoader.vue';
import TopicInput from './TopicInput.vue';
import { pipe, stableRandom, starCount, starred } from './utils';

export default {
  components: {
    ClaimInput,
    DeleteButton,
    DwdLoader,
    TopicInput,
  },
  data: () => ({
    tempId: '',
    title: '',
    text: '',
    subTopicIds: [''],
    claimIds: [''],
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    topic: function () {
      return this.$store.state.topics[this.id] || null;
    },
    needsData: function () {
      return this.id && !this.topic;
    },
  },
  methods: {
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
        topic: {
          title: this.title,
          text: this.text,
          subTopicIds: filter(this.subTopicIds, this.lookupTopic),
          claimIds: filter(this.claimIds, this.lookupClaim),
        },
      };
      if (this.id) {
        action = 'updateTopic';
        payload.id = this.id;
      } else {
        payload.topic.id = this.tempId;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.topicUrl(id));
      });
    },
    remove: function () {
      this.$store.dispatch('removeTopic', {
        id: this.id,
      }).then(() => {
        this.$router.push('/topics');
      });
    },
    cancel: function () {
      this.$router.push(this.id ? this.topicUrl(this.id) : '/topics');
    },
    initialize: function () {
      this.title = this.topic.title;
      this.text = this.topic.text;

      let topicStarred = pipe(this.lookupTopic, starred);
      let topicStarCount = pipe(this.lookupTopic, starCount);
      this.subTopicIds = sortBy(this.topic.subTopicIds,
          [topicStarred, topicStarCount, stableRandom]);
      // Append an empty input for new sub-topics.
      this.subTopicIds.push('');

      let claimStarred = pipe(this.lookupClaim, starred);
      let claimStarCount = pipe(this.lookupClaim, starCount);
      this.claimIds = sortBy(this.topic.claimIds,
          [claimStarred, claimStarCount, stableRandom]);
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
      } else if (this.id) {
        this.initialize();
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

<style lang="sass" module>
.fixedBottom
  bottom: 0
  left: 50%
  margin-left: -150px
  padding: 8px
  position: fixed
  width: 300px
  z-index: 1
</style>
