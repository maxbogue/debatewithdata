<template>
<div v-if="items.length > 0" :class="$style.trail">
  <item-block v-for="([type, item, isFor], i) in items"
              :key="item.id"
              :item="item"
              :type="type"
              :trail="ids.slice(0, i)"
              :is-for="isFor"
              is-link
              abbreviated />
</div>
</template>

<script>
import map from 'lodash/map';
import takeWhile from 'lodash/takeWhile';

import ItemBlock from './ItemBlock.vue';

export default {
  components: {
    ItemBlock,
  },
  props: {
    ids: { type: Array, required: true },
  },
  computed: {
    topics: function () {
      return takeWhile(map(this.ids, this.lookupTopic), Boolean);
    },
    itemIds: function () {
      return this.ids.slice(this.topics.length);
    },
    items: function () {
      let items = map(this.topics, (topic) => ['topic', topic, null]);
      if (this.itemIds.length < 2) {
        return items;
      }
      let item = this.lookupClaim(this.itemIds[0]);
      let isFor = null;
      for (let i = 1; i < this.itemIds.length; i++) {
        if (!item) {
          return items;
        }
        let nextId = this.itemIds[i];
        let [type, next, nextIsFor] = this.findInside(item.points, nextId);
        if (!type) {
          console.warn('Broken link found in trail: ' + nextId);
          return items;
        }
        items.push([type, item, isFor]);
        item = next;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
      }
      return items;
    },
    lastIsFor: function () {
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
        let [type, next, nextIsFor] = this.findInside(item.points, nextId);
        if (!type) {
          return null;
        }
        item = next;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
      }
      return isFor;
    },
  },
  watch: {
    lastIsFor: function () {
      this.$emit('lastIsFor', this.lastIsFor);
    },
  },
  mountedTriggersWatchers: true,
  methods: {
    findInside: function (points, id) {
      if (!points) {
        return [''];
      }
      for (let i = 0; i < 2; i++) {
        for (let pointId in points[i]) {
          if (!Object.prototype.hasOwnProperty.call(points[i], pointId)) {
            continue;
          }
          let point = points[i][pointId];
          if (point.type === 'claim' && point.claimId === id) {
            let claim = this.lookupClaim(id);
            return ['claim', claim, i === 0];
          } else if (point.type === 'source' && point.sourceId === id) {
            let source = this.lookupSource(id);
            return ['source', source, i === 0];
          }
        }
      }
      return [''];
    },
  },
};
</script>

<style lang="scss" module>
.trail {
  margin-bottom: -8px;

  :global(.topic),
  :global(.claim),
  :global(.source) {
    width: 50%;
    margin: 8px auto 0;
    font-size: 0.8em;

    :global(.bubble) {
      padding: 0.8em 1em;
      text-decoration: none;
    }
  }
}
</style>
