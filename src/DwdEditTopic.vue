<template>
<div>
  <form v-if="!needsData" class="row gutter-16" @submit.prevent="submit">
    <div class="col-xs-12">
      <div class="topic t1">
        <div class="bubble">
          <label v-if="!id" for="id" class="hint">
            The ID shows up in the URL.
          </label>
          <textarea v-if="!id" id="id"
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
                    placeholder="claim"
                    v-model="text"
                    v-auto-resize></textarea>
        </div>
        <div v-if="text" class="info">
          <span class="id mono">{{ id || 'new' }}</span>
        </div>
      </div>
      <claim-input v-for="(claimId, i) in claimIds"
                   class="col-xs-12 claim block"
                   :id="claimId"
                   @update="(newId) => updateClaimId(i, newId)"
                   :key="'claim-' + i"></claim-input>
    </div>
    <div v-if="id" class="col-xs-12 center">
      <delete-button noun="Claim" @delete="remove"></delete-button>
    </div>
    <div class="col-xs-12 center fixed-bottom blue">
      <button type="submit" class="btn btn-primary">Submit</button>
      <button type="button"
              class="btn btn-default"
              @click="cancel">Cancel</button>
    </div>
  </form>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import filter from 'lodash/filter';

import ClaimInput from './ClaimInput.vue';
import DeleteButton from './DeleteButton.vue';
import DwdLoader from './DwdLoader.vue';

export default {
  components: {
    ClaimInput,
    DeleteButton,
    DwdLoader,
  },
  data: () => ({
    tempId: '',
    title: '',
    text: '',
    claimIds: [],
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
          claims: filter(this.claimIds, (id) => this.$store.state.claims[id]),
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
      this.claimIds = this.topic.claims;
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

<style lang="sass" scoped>
.fixed-bottom
  bottom: 0
  left: 50%
  margin-left: -150px
  padding: 8px
  position: fixed
  width: 300px
  z-index: 1
</style>
