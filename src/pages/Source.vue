<template>
<div>
  <dwd-trail :ids="trail.concat(id)" @lastIsFor="(v) => isFor = v" />
  <template v-if="source">
    <item-block :item="source"
                :is-for="isFor"
                :trail="trail"
                type="source" />
    <h3 v-if="claims.length > 0">Referenced In</h3>
    <item-block v-for="claim in claims"
                :key="claim.id"
                :item="claim"
                type="claim"
                is-link
                abbreviated />
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import filter from 'lodash/filter';
import map from 'lodash/map';

import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import ItemBlock from '../ItemBlock.vue';
import { ItemType } from '../../common/constants';

export default {
  components: {
    DwdLoader,
    DwdTrail,
    ItemBlock,
  },
  data: () => ({
    showComments: false,
    isFor: null,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
    claims: function () {
      if (!this.source || !this.source.claimIds) {
        return [];
      }
      let notInTrail = filter(
        this.source.claimIds, (id) => !this.trail.includes(id));
      return map(notInTrail, this.lookupClaim);
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
      if (!this.source || !this.source.claimIds) {
        this.$store.dispatch('getItem', {
          type: ItemType.SOURCE,
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
};
</script>
