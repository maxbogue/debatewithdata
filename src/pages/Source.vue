<template>
<div>
  <dwd-trail :ids="trail.concat(id)" @lastIsFor="(v) => isFor = v" />
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
</div>
</template>

<script>
import filter from 'lodash/filter';
import map from 'lodash/map';

import DwdLoader from '@/components/DwdLoader.vue';
import DwdTrail from '@/components/DwdTrail.vue';
import ItemBlock from '@/components/ItemBlock.vue';
import { ItemType } from '@/common/constants';
import { parseTrail, titleFromText } from '@/utils';

export default {
  components: {
    DwdLoader,
    DwdTrail,
    ItemBlock,
  },
  async asyncData({ store, route }) {
    let id = route.params.id;
    let source = store.state.sources[id];
    if (!source || !source.claimIds) {
      let promise = store.dispatch('getItem', {
        type: ItemType.SOURCE,
        id,
        trail: parseTrail(route.query.trail),
      });
      if (!source) {
        await promise;
      }
    }
  },
  metaInfo() {
    let title = `Data ${this.id}`;
    if (this.source) {
      title = titleFromText(this.source.text);
    }
    return { title };
  },
  data: () => ({
    showComments: false,
    isFor: null,
  }),
  computed: {
    id() {
      return this.$route.params.id;
    },
    source() {
      return this.$store.state.sources[this.id] || null;
    },
    trail() {
      return this.parseTrail(this.$route.query.trail);
    },
    claims() {
      if (!this.source || !this.source.claimIds) {
        return [];
      }
      let notInTrail = filter(
        this.source.claimIds,
        id => !this.trail.includes(id)
      );
      return map(notInTrail, this.lookupClaim);
    },
  },
};
</script>
