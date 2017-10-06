<template>
<div v-if="items.length > 0" class="trail">
  <template v-for="[item, nextIsFor, url] in items">
    <router-link v-if="url"
                 :to="url"
                 :key="item.id"
                 class="bubble blue">
      {{ item.text }}
    </router-link>
    <span v-else :key="item.id" class="bubble blue">{{ item.text }}</span>
  </template>
</div>
</template>

<script>
const ID = /^[0-9a-f]{12}$/;

export default {
  computed: {
    ids: function () {
      if (!this.$route.query.trail) {
        return [];
      }
      let ids = this.$route.query.trail.split(',');
      if (!ids.reduce((acc, id) => acc && ID.test(id), true)) {
        // Something doesn't look like an ID.
        return [];
      }
      ids.push(this.$route.params.id);
      return ids;
    },
    items: function () {
      if (this.ids.length < 2) {
        return [];
      }
      let items = [];
      let item = this.$store.state.claims[this.ids[0]];
      let itemUrl = this.claimUrl(item.id);
      for (let i = 1; i < this.ids.length; i++) {
        if (!item) {
          return [];
        }
        let nextId = this.ids[i];
        let [wasFound, isFor, next, nextUrl] =
            this.findInside(item.points, nextId);
        if (!wasFound) {
          console.warn('Trail error: ' + nextId);
          return [];
        }
        items.push([item, isFor, itemUrl]);
        item = next;
        itemUrl = nextUrl;
      }
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
          } else if (point.type === 'subclaim' && pointId === id) {
            return [true, i === 0, point];
          }
        }
      }
      return [false];
    },
  },
};
</script>

<style>
.trail {
  margin-bottom: -16px;
}
.trail .bubble {
  display: block;
  margin: 8px auto;
  padding: 8px;
  text-decoration: none;
  width: 50%;
}
</style>
