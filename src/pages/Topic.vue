<template>
  <div>
    <dwd-trail :ids="trail" />
    <div v-if="trail.length === 0">
      <item-block
        v-for="superTopic in superTopics"
        :key="superTopic.id"
        :item="superTopic"
        type="topic"
        abbreviated
        is-link
        mini
        half
      />
    </div>
    <item-block :item="topic" :trail="trail" type="topic" show-info />
    <template v-if="subTopics.length > 0">
      <h3>Sub-Topics</h3>
      <item-block
        v-for="subTopic in subTopics"
        :key="subTopic.id"
        :item="subTopic"
        :trail="newTrail"
        type="topic"
        is-link
        abbreviated
      />
    </template>
    <template v-if="claims.length > 0">
      <h3>Key Claims</h3>
      <item-block
        v-for="claim in claims"
        :key="claim.id"
        :item="claim"
        :trail="newTrail"
        type="claim"
        is-link
        abbreviated
      />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import DwdTrail from '@/components/DwdTrail.vue';
import ItemBlock from '@/components/ItemBlock.vue';
import { ItemType } from '@/common/constants';
import { isItemAlive, parseTrail } from '@/utils';

export default {
  components: {
    DwdTrail,
    ItemBlock,
  },
  async asyncData({ store, route }) {
    const id = route.params.id;
    const topic = store.state.topics[id];
    if (!topic || topic.depth < 3) {
      const promise = store.dispatch('getItem', {
        type: ItemType.TOPIC,
        id,
        trail: parseTrail(route.query.trail),
      });
      if (!topic) {
        await promise;
      }
    }
  },
  metaInfo() {
    if (!isItemAlive(this.topic)) {
      return {};
    }
    return {
      title: this.topic.title,
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.topic.text,
        },
        {
          vmid: 'og:description',
          name: 'og:description',
          content: `Topic: ${this.topic.text}`,
        },
      ],
    };
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    ...mapGetters('sort', ['sortByStars']),
    id() {
      return this.$route.params.id;
    },
    topic() {
      return this.lookupTopic(this.id);
    },
    subTopics() {
      if (!this.topic || this.topic.deleted || this.topic.depth < 2) {
        return [];
      }
      return this.sortByStars(this.topic.subTopicIds.map(this.lookupTopic));
    },
    claims() {
      if (!this.topic || this.topic.deleted || this.topic.depth < 2) {
        return [];
      }
      return this.sortByStars(this.topic.claimIds.map(this.lookupClaim));
    },
    trail() {
      return this.parseTrail(this.$route.query.trail);
    },
    newTrail() {
      return this.trail.concat(this.id);
    },
    superTopics() {
      if (!this.topic || !this.topic.superTopicIds) {
        return [];
      }
      return this.topic.superTopicIds.map(this.lookupTopic);
    },
  },
};
</script>
