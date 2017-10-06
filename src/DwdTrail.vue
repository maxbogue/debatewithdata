<template>
<div v-if="items.length > 0" class="trail">
  <div v-for="[item, nextIsFor, url] in items" :key="item.id">
    <router-link v-if="url"
                 class="bubble blue"
                 :to="url">
      {{ item.text }}
    </router-link>
    <div v-else class="bubble blue">{{ item.text }}</div>
    <div class="ind" :class="[nextIsFor ? 'for' : 'against']"></div>
  </div>
</div>
</template>

<script>
const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
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
      if (this.ids.length < 2) {
        return [];
      }
      let items = [];
      let item = this.$store.state.claims[this.ids[0]];
      let itemUrl = this.claimUrl(this.ids[0]);
      for (let i = 1; i < this.ids.length; i++) {
        if (!item) {
          return [];
        }
        let nextId = this.ids[i];
        let [wasFound, isFor, next, nextUrl] =
            this.findInside(item.points, nextId);
        if (!wasFound) {
          console.warn('Broken link found in trail: ' + nextId);
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
  margin: 8px 0 -12px;
}
.trail .bubble {
  display: block;
  margin: 4px auto;
  padding: 8px;
  text-decoration: none;
  width: 50%;
}
.trail .ind {
  color: rgba(0, 0, 0, 0.65);
  display: block;
  font-family: 'Glyphicons Halflings';
  text-align: center;
}
.ind.for:before {
  content: "\e081";
}
.ind.against:before {
  content: "\e082";
}
</style>
