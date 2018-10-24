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
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import { mapGetters, mapState } from 'vuex';

import ClaimContent from '@/components/ClaimContent.vue';
import ClaimLinkModal from '@/components/ClaimLinkModal.vue';
import ClaimRevAndModalEdit from '@/components/ClaimRevAndModalEdit.vue';
import DeleteButton from '@/components/DeleteButton.vue';
import FixedBottom from '@/components/FixedBottom.vue';
import TopicEditAndReviewBlock from '@/components/TopicEditAndReviewBlock.vue';
import TopicLinkModal from '@/components/TopicLinkModal.vue';
import { ItemType } from '@/common/constants';
import { diffIdLists, parseTrail, pipe } from '@/utils';
import { topicsAreEqual } from '@/common/equality';

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
  async asyncData({ store, route }) {
    const id = route.params.id;
    const topic = store.state.topics[id];
    if (id && (!topic || topic.depth < 2)) {
      await store.dispatch('getItem', {
        type: ItemType.TOPIC,
        id,
        trail: parseTrail(route.query.trail),
      });
    }
  },
  metaInfo() {
    return {
      title: `Editing topic ${this.id}`,
    };
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    newTopicPartial: {
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
    ...mapState(['user']),
    ...mapGetters('sort', ['starred', 'starCount', 'stableRandom']),
    newId() {
      return this.newTopicPartial && this.newTopicPartial.id;
    },
    topic() {
      return this.lookupTopic(this.id);
    },
    linkedSubTopics() {
      const oldSubTopicIds = this.topic ? this.topic.subTopicIds : [];
      return diffIdLists(
        this.subTopicIds,
        oldSubTopicIds,
        this.$store.state.topics
      );
    },
    linkedClaims() {
      const oldClaimIds = this.topic ? this.topic.claimIds : [];
      return diffIdLists(this.claimIds, oldClaimIds, this.$store.state.claims);
    },
    newTopicLinks() {
      return {
        subTopicIds: filter(this.lookupTopic, this.subTopicIds),
        claimIds: filter(this.lookupClaim, this.claimIds),
        newSubTopics: this.newSubTopics,
        newClaims: this.newClaims,
      };
    },
    newTopic() {
      return {
        ...this.newTopicPartial,
        ...this.newTopicLinks,
      };
    },
    noChange() {
      return topicsAreEqual(this.topic, this.newTopic);
    },
    trail() {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: {
      immediate: true,
      handler: 'initialize',
    },
    newTopicLinks() {
      this.showEditBlock = false;
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload(e) {
      if (this.unloadOverride || this.noChange) {
        // Don't warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
    addSubTopicId(subTopicId) {
      if (!this.subTopicIds.includes(subTopicId)) {
        this.subTopicIds.splice(0, 0, subTopicId);
      }
    },
    addNewSubTopic(newSubTopic) {
      this.newSubTopics.splice(0, 0, newSubTopic);
    },
    addClaimId(claimId) {
      if (!this.claimIds.includes(claimId)) {
        this.claimIds.splice(0, 0, claimId);
      }
    },
    addNewClaim(newClaim) {
      this.newClaims.splice(0, 0, newClaim);
    },
    toggleDeleted(ids, id) {
      const i = ids.indexOf(id);
      if (i < 0) {
        ids.push(id);
      } else {
        ids.splice(i, 1);
      }
    },
    async submit() {
      let action = 'addItem';
      const payload = {
        type: ItemType.TOPIC,
        item: this.newTopic,
      };
      if (this.id) {
        action = 'updateItem';
        payload.item.id = this.topic.id;
        payload.item.baseRev = this.topic.revId;
      }
      const id = await this.$store.dispatch(action, payload);
      this.unloadOverride = true;
      this.$router.push(this.topicUrl(id, this.trail));
    },
    async remove(message) {
      await this.$store.dispatch('removeItem', {
        type: ItemType.TOPIC,
        id: this.topic.id,
        message,
      });
      this.unloadOverride = true;
      this.$router.push('/topics');
    },
    cancel() {
      const url = this.topic ? this.topicUrl(this.id, this.trail) : '/topics';
      this.$router.push(url);
    },
    initialize() {
      const seed = this.seed || this.topic;
      if (seed && !seed.deleted) {
        this.newTopicPartial = {
          title: seed.title || '',
          text: seed.text || '',
        };

        const topicStarred = pipe(
          this.lookupTopic,
          this.starred
        );
        const topicStarCount = pipe(
          this.lookupTopic,
          this.starCount
        );
        this.subTopicIds = sortBy(
          [topicStarred, topicStarCount, this.stableRandom],
          seed.subTopicIds
        );

        const claimStarred = pipe(
          this.lookupClaim,
          this.starred
        );
        const claimStarCount = pipe(
          this.lookupClaim,
          this.starCount
        );
        this.claimIds = sortBy(
          [claimStarred, claimStarCount, this.stableRandom],
          seed.claimIds
        );
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
