<template>
<div v-if="topics.length + items.length > 0" :class="$style.trail">
  <router-link v-for="(topic, i) in topics"
               class="block topic"
               :to="topicUrl(topic.id, ids.slice(0, i))"
               :key="topic.id">{{ topic.title }}</router-link>
  <template v-for="[item, url, isFor] in items">
    <router-link v-if="url"
                 :class="itemClass(isFor)"
                 :to="url"
                 :key="item.id">{{ item.text }}</router-link>
    <div v-else
         :class="itemClass(isFor)"
         :key="item.id">{{ item.text }}</div>
  </template>
</div>
</template>

<script>
import map from 'lodash/map';
import takeWhile from 'lodash/takeWhile';

export default {
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
      if (this.itemIds.length < 2) {
        return [];
      }
      let items = [];
      let item = this.lookupClaim(this.itemIds[0]);
      let isFor = null;
      let itemUrl = this.claimUrl(this.itemIds[0]);
      for (let i = 1; i < this.itemIds.length; i++) {
        if (!item) {
          return [];
        }
        let nextId = this.itemIds[i];
        let [wasFound, nextIsFor, next, nextUrl] =
            this.findInside(item.points, nextId);
        if (!wasFound) {
          console.warn('Broken link found in trail: ' + nextId);
          return [];
        }
        items.push([item, itemUrl, isFor]);
        item = next;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
        itemUrl = nextUrl;
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
        let [wasFound, nextIsFor, next] = this.findInside(item.points, nextId);
        if (!wasFound) {
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
        return [false];
      }
      for (let i = 0; i < 2; i++) {
        for (let pointId in points[i]) {
          if (!Object.prototype.hasOwnProperty.call(points[i], pointId)) {
            continue;
          }
          let point = points[i][pointId];
          if (point.type === 'claim' && point.claimId === id) {
            let claim = this.$store.state.claims[id];
            let trail = this.ids.slice(0, this.ids.indexOf(id));
            let url = this.claimUrl(id, trail);
            return [Boolean(claim), i === 0, claim, url];
          } else if (point.type === 'source' && point.sourceId === id) {
            let source = this.$store.state.sources[id];
            return [Boolean(source), i === 0, source];
          } else if (point.type === 'subclaim' && pointId === id) {
            return [true, i === 0, point];
          }
        }
      }
      return [false];
    },
    itemClass: function (isFor) {
      let color = isFor === null ? 'blue' : isFor ? 'purple' : 'amber';
      return ['block', color];
    },
  },
};
</script>

<style lang="scss" module>
.trail {
  margin-bottom: -8px;

  \:global(.block) {
    display: block;
    font-size: 0.8em;
    margin: 8px auto 0;
    padding: 0.8em 1em;
    text-decoration: none;
    width: 50%;
  }
}
</style>
