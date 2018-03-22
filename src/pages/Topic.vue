<template>
<div>
  <dwd-trail :ids="trail" />
  <template v-if="topic">
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
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import map from 'lodash/map';

import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import ItemBlock from '../ItemBlock.vue';
import { sortByStars } from '../utils';

export default {
  components: {
    DwdLoader,
    DwdTrail,
    ItemBlock,
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
    checkLoaded: function () {
      if (!this.topic) {
        this.$store.dispatch('getTopic', {
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
};
</script>
