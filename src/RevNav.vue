<template>
<div class="block no-pad center">
  <h3 class="mono">{{ curr.revId }}</h3>
  <div><strong>by</strong> {{ curr.username }}</div>
  <div><strong>created</strong> {{ curr.createdAt | timestamp }}</div>
  <div :class="$style.nav">
    <router-link :to="prevUrl"
                 :class="{ [$style.hidden]: !prevUrl }"
                 class="dwd-btn grey">Prev</router-link>
    <router-link :to="url + '/history'"
                 class="dwd-btn grey">History</router-link>
    <router-link :to="nextUrl"
                 :class="{ [$style.hidden]: !nextUrl }"
                 class="dwd-btn grey">Next</router-link>
  </div>
  <div>
    <router-link v-if="revertTo"
                 :class="$style.revert"
                 :to="revertTo">Revert To This Revision</router-link>
  </div>
</div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import dateFormat from 'dateformat';
import forEach from 'lodash/forEach';

function removeBadFields(points) {
  for (let sidePoints of points) {
    forEach(sidePoints, (point) => {
      delete point.claim;
      delete point.source;
      if (point.points) {
        removeBadFields(point.points);
      }
    });
  }
}

function strip(type, item) {
  if (type !== 'claim') {
    return item;
  }
  item = cloneDeep(item);
  removeBadFields(item.points);
  return item;
}

export default {
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
  props: {
    itemType: { type: String, required: true },
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
    next: { type: Object, default: null },
  },
  computed: {
    url: function () {
      return '/' + this.itemType + '/' + this.curr.id;
    },
    prevUrl: function () {
      return this.prev ? this.url + '/rev/' + this.prev.revId : '';
    },
    nextUrl: function () {
      return this.next ? this.url + '/rev/' + this.next.revId : '';
    },
    // This is an ugly hack to get around claim and source being placed inside
    // point revisions.
    stripped: function () {
      return strip(this.itemType, this.curr);
    },
    revertTo: function () {
      if (!this.next || this.curr.deleted || this.itemType === 'point') {
        // Can't revert if already HEAD, deleted, or for any points.
        return null;
      }
      return {
        name: this.itemType + 'Edit',
        params: { id: this.curr.id, seed: this.stripped },
      };
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.hidden {
  visibility: hidden;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    width: 7em;
  }
}

.revert:hover {
  text-decoration: underline;
}
</style>
