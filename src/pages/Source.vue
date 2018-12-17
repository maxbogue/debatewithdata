<template>
  <div>
    <dwd-trail :ids="trail.concat(id)" @lastIsFor="v => (isFor = v)" />
    <item-block :item="source" :is-for="isFor" :trail="trail" type="source" />
    <h3 v-if="claims.length > 0">Referenced In</h3>
    <item-block
      v-for="claim in claims"
      :key="claim.id"
      :item="claim"
      type="claim"
      is-link
      abbreviated
    />
  </div>
</template>

<script>
import DwdTrail from '@/components/DwdTrail.vue';
import ItemBlock from '@/components/ItemBlock.vue';
import { ItemType } from '@/common/constants';
import { isItemAlive, parseTrail, titleFromText } from '@/utils';

export default {
  components: {
    DwdTrail,
    ItemBlock,
  },
  async asyncData({ store, route }) {
    const id = route.params.id;
    const source = store.state.sources[id];
    if (!source || !source.claimIds) {
      const promise = store.dispatch('getItem', {
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
    if (!isItemAlive(this.source)) {
      return {};
    }
    return {
      title: titleFromText(this.source.text),
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.source.text,
        },
        {
          vmid: 'og:description',
          name: 'og:description',
          content: `Data: ${this.source.text}`,
        },
      ],
    };
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
      const notInTrail = this.source.claimIds.filter(
        id => !this.trail.includes(id)
      );
      return notInTrail.map(this.lookupClaim);
    },
  },
};
</script>
