<template>
<div>
  <div v-if="!id && (!user || !user.admin)"
       class="block no-pad">
    Must be an admin to add a root-level topic.
  </div>
  <topic-edit-and-review-block :topic.sync="newTopicPartial"
                               :prev="topic"
                               :show-edit-block.sync="showEditBlock" />
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
  <topic-edit-and-review-block v-for="(subTopic, i) in newSubTopics"
                               :key="'newSubTopic' + i"
                               :topic="subTopic"
                               use-modal
                               @update:topic="(t) => $set(newSubTopics, i, t)"
                               @delete="newSubTopics.splice(i, 1)" />
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
  <claim-rev-and-modal-edit v-for="(claim, i) in newClaims"
                            :key="claim.id"
                            :claim="claim"
                            @update="(c) => $set(newClaims, i, c)"
                            @delete="newClaims.splice(i, 1)" />
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
    <button :disabled="noChange || showEditBlock"
            type="button"
            class="dwd-btn pink-dark"
            @click="submit">Submit</button>
  </fixed-bottom>
</div>
</template>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import { mapState } from 'vuex';

import ClaimContent from '../components/ClaimContent.vue';
import ClaimLinkModal from '../components/ClaimLinkModal.vue';
import ClaimRevAndModalEdit from '../components/ClaimRevAndModalEdit.vue';
import DeleteButton from '../components/DeleteButton.vue';
import FixedBottom from '../components/FixedBottom.vue';
import TopicEditAndReviewBlock from '../components/TopicEditAndReviewBlock.vue';
import TopicLinkModal from '../components/TopicLinkModal.vue';
import { ItemType } from '../common/constants';
import {
  authRedirect, diffIdLists, parseTrail, pipe, stableRandom, starCount, starred
} from '../utils';
import { topicsAreEqual } from '../common/equality';

const BEFORE_UNLOAD_MESSAGE = 'Discard changes?';

function confirmLeave(to, from, next) {
  /* eslint no-invalid-this: "off" */
  if (this.unloadOverride || this.noChange) {
    next();
    return;
  }
  if (!window.confirm(BEFORE_UNLOAD_MESSAGE)) {
    next(false);
  } else {
    next();
  }
}

export default {
  beforeRouteEnter: authRedirect,
  beforeRouteUpdate: confirmLeave,
  beforeRouteLeave: confirmLeave,
  components: {
    ClaimContent,
    ClaimLinkModal,
    ClaimRevAndModalEdit,
    DeleteButton,
    FixedBottom,
    TopicEditAndReviewBlock,
    TopicLinkModal,
  },
  asyncData: async function ({ store, route }) {
    let id = route.params.id;
    let topic = store.state.topics[id];
    if (id && (!topic || topic.depth < 2)) {
      await store.dispatch('getItem', {
        type: ItemType.TOPIC,
        id,
        trail: parseTrail(route.query.trail),
      });
    }
  },
  metaInfo: function () {
    return {
      title: `Editing topic ${this.id}`,
    };
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    newTopicPartial:  {
      title: '',
      text: '',
    },
    subTopicIds: [],
    newSubTopics: [],
    claimIds: [],
    newClaims: [],
    showEditBlock: false,
    showSubTopicModal: false,
    showClaimModal: false,
    unloadOverride: false,
  }),
  computed: {
    ...mapState([
      'user',
    ]),
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
    newTopicLinks: function () {
      return {
        subTopicIds: filter(this.subTopicIds, this.lookupTopic),
        claimIds: filter(this.claimIds, this.lookupClaim),
        newSubTopics: this.newSubTopics,
        newClaims: this.newClaims,
      };
    },
    newTopic: function () {
      return {
        ...this.newTopicPartial,
        ...this.newTopicLinks,
      };
    },
    noChange: function () {
      return topicsAreEqual(this.topic, this.newTopic);
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: function () {
      this.initialize();
    },
    newTopicLinks: function () {
      this.showEditBlock = false;
    },
  },
  mounted: function () {
    this.initialize();
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy: function () {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload: function (e) {
      if (this.unloadOverride || this.noChange) {
        // Don't warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
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
    submit: async function () {
      let action = 'addItem';
      let payload = {
        type: ItemType.TOPIC,
        item: this.newTopic,
      };
      if (this.id) {
        action = 'updateItem';
        payload.item.id = this.topic.id;
        payload.item.baseRev = this.topic.revId;
      }
      let id = await this.$store.dispatch(action, payload);
      this.unloadOverride = true;
      this.$router.push(this.topicUrl(id, this.trail));
    },
    remove: async function (message) {
      await this.$store.dispatch('removeItem', {
        type: ItemType.TOPIC,
        id: this.topic.id,
        message,
      });
      this.unloadOverride = true;
      this.$router.push('/topics');
    },
    cancel: function () {
      let url = this.topic ? this.topicUrl(this.id, this.trail) : '/topics';
      this.$router.push(url);
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
      }
      if (!this.seed) {
        // Done next tick so it comes after newTopicLinks watcher.
        this.$nextTick(() => {
          this.showEditBlock = true;
        });
      }
    },
  },
};
</script>
