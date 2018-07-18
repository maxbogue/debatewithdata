<template>
<div>
  <dwd-trail :ids="trail" />
  <div v-if="trail.length === 0">
    <item-block v-for="superTopic in superTopics"
                :key="superTopic.id"
                :item="superTopic"
                type="topic"
                abbreviated
                is-link
                mini
                half />
  </div>
  <item-block :item="topic"
              :trail="trail"
              type="topic"
              show-info />
  <template v-if="subTopics.length > 0">
    <h3>Sub-Topics</h3>
    <item-block v-for="subTopic in subTopics"
                :key="subTopic.id"
                :item="subTopic"
                :trail="newTrail"
                type="topic"
                is-link
                abbreviated />
  </template>
  <template v-if="claims.length > 0">
    <h3>Key Claims</h3>
    <item-block v-for="claim in claims"
                :key="claim.id"
                :item="claim"
                :trail="newTrail"
                type="claim"
                is-link
                abbreviated />
  </template>
</div>
</template>

<script>
import map from 'lodash/map';

import DwdTrail from '../components/DwdTrail.vue';
import ItemBlock from '../components/ItemBlock.vue';
import { ItemType } from '../../common/constants';
import { parseTrail, sortByStars } from '../utils';

export default {
  components: {
    DwdTrail,
    ItemBlock,
  },
  asyncData: async function ({ store, route }) {
    let id = route.params.id;
    let topic = store.state.topics[id];
    if (!topic || topic.depth < 3) {
      let promise = store.dispatch('getItem', {
        type: ItemType.TOPIC,
        id,
        trail: parseTrail(route.query.trail),
      });
      if (!topic) {
        await promise;
      }
    }
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    topic: function () {
      return this.lookupTopic(this.id);
    },
    subTopics: function () {
      if (!this.topic || this.topic.deleted) {
        return [];
      }
      return sortByStars(map(this.topic.subTopicIds, this.lookupTopic));
    },
    claims: function () {
      if (!this.topic || this.topic.deleted) {
        return [];
      }
      return sortByStars(map(this.topic.claimIds, this.lookupClaim));
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
    newTrail: function () {
      return this.trail.concat(this.id);
    },
    superTopics: function () {
      if (!this.topic) {
        return [];
      }
      return map(this.topic.superTopicIds || [], this.lookupTopic);
    },
  },
};
</script>
