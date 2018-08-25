<template>
<div v-if="items.length > 0" :class="$style.trail">
  <item-block v-for="([type, item, isFor], i) in items"
              :key="item.id"
              :item="item"
              :type="type"
              :trail="ids.slice(0, i)"
              :is-for="isFor"
              is-link
              abbreviated
              mini
              half />
</div>
</template>

<script>
import map from 'lodash/map';
import takeWhile from 'lodash/takeWhile';

import ItemBlock from './ItemBlock.vue';
import { ItemType } from '@/common/constants';

export default {
  components: {
    ItemBlock,
  },
  props: {
    ids: { type: Array, required: true },
  },
  computed: {
    topics() {
      return takeWhile(map(this.ids, this.lookupTopic), Boolean);
    },
    itemIds() {
      return this.ids.slice(this.topics.length);
    },
    items() {
      let items = map(this.topics, (topic) => [ItemType.TOPIC, topic, null]);
      if (this.itemIds.length < 2) {
        return items;
      }
      let item = this.lookupClaim(this.itemIds[0]);
      let type = ItemType.CLAIM;
      let isFor = null;
      for (let i = 1; i < this.itemIds.length; i++) {
        if (!item) {
          return items;
        }
        let nextId = this.itemIds[i];
        let [nextType, next, nextIsFor] = this.findInside(item, nextId);
        if (!nextType) {
          console.warn('Broken link found in trail: ' + nextId);
          return items;
        }
        items.push([type, item, isFor]);
        item = next;
        type = nextType;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
      }
      return items;
    },
    lastIsFor() {
      if (this.itemIds.length < 2) {
        return null;
      }
      let item = this.lookupClaim(this.itemIds[0]);
      let isFor = null;
      for (let i = 1; i < this.itemIds.length; i++) {
        if (!item) {
          return null;
        }
        let nextId = this.itemIds[i];
        let [nextType, next, nextIsFor] = this.findInside(item, nextId);
        if (!nextType) {
          return null;
        }
        item = next;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
      }
      return isFor;
    },
  },
  watch: {
    lastIsFor() {
      this.$emit('lastIsFor', this.lastIsFor);
    },
  },
  mountedTriggersWatchers: true,
  methods: {
    findInside(item, id) {
      if (item.subClaimIds && typeof item.subClaimIds[id] === 'boolean') {
        let claim = this.lookupClaim(id);
        return [ItemType.CLAIM, claim, item.subClaimIds[id]];
      } else if (item.sourceIds && typeof item.sourceIds[id] === 'boolean') {
        let source = this.lookupSource(id);
        return [ItemType.SOURCE, source, item.sourceIds[id]];
      }
      return [''];
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.trail {
  :global(.topic),
  :global(.claim),
  :global(.source) {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: calc(50% - #{$accent-border-width / 2});
      width: 4px;
      height: $mini-block-spacing;
      transform: translate(-50%, 100%);
      background: $white-accent;
    }
  }
}
</style>
