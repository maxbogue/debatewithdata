<template>
<div v-if="items.length > 0" :class="$style.trail">
  <template v-for="[item, isFor, url] in items">
    <router-link v-if="url"
                 :class="itemClass(isFor)"
                 :to="url"
                 :key="item.id">
      {{ item.text }}
    </router-link>
    <div v-else :class="itemClass(isFor)" :key="item.id">{{ item.text }}</div>
  </template>
</div>
</template>

<script>
const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  data: () => ({
    lastIsFor: null,
  }),
  computed: {
    ids: function () {
      if (!this.$route.query.trail) {
        return [];
      }
      let ids = this.$route.query.trail.split(',');
      for (let i = 0; i < ids.length; i++) {
        if (!ID_REGEX.test(ids[i])) {
          console.warn('Malformed ID detected in trail: ' + ids[i]);
          return [];
        }
      }
      ids.push(this.$route.params.id);
      return ids;
    },
    items: function () {
      this.lastIsFor = null;
      if (this.ids.length < 2) {
        return [];
      }
      let items = [];
      let item = this.$store.state.claims[this.ids[0]];
      let isFor = null;
      let itemUrl = this.claimUrl(this.ids[0]);
      for (let i = 1; i < this.ids.length; i++) {
        if (!item) {
          return [];
        }
        let nextId = this.ids[i];
        let [wasFound, nextIsFor, next, nextUrl] =
            this.findInside(item.points, nextId);
        if (!wasFound) {
          console.warn('Broken link found in trail: ' + nextId);
          return [];
        }
        items.push([item, isFor, itemUrl]);
        item = next;
        isFor = isFor === null ? nextIsFor : isFor === nextIsFor;
        itemUrl = nextUrl;
      }
      this.lastIsFor = isFor;
      return items;
    },
  },
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
      return ['bubble', color];
    },
  },
  watch: {
    lastIsFor: function () {
      this.$emit('lastIsFor', this.lastIsFor);
    },
  },
};
</script>

<style lang="sass" module>
.trail
  margin-bottom: -8px

  \:global(.bubble)
    display: block
    margin: 8px auto 0
    padding: 8px
    text-decoration: none
    width: 50%
</style>
