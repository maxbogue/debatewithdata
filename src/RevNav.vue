<template>
<div class="block no-pad center">
  <h3 class="mono">{{ curr.id }}</h3>
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
</div>
</template>

<script>
import dateFormat from 'dateformat';

export default {
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
  props: {
    itemType: { type: String, required: true },
    itemId: { type: String, required: true },
    revId: { type: String, required: true },
    revs: { type: Array, required: true },
  },
  computed: {
    revIndex: function () {
      return this.revs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.revs[this.revIndex];
    },
    prev: function () {
      return this.revs[this.revIndex + 1];
    },
    next: function () {
      return this.revs[this.revIndex - 1];
    },
    url: function () {
      return '/' + this.itemType + '/' + this.itemId;
    },
    prevUrl: function () {
      return this.prev ? this.url + '/rev/' + this.prev.id : '';
    },
    nextUrl: function () {
      return this.next ? this.url + '/rev/' + this.next.id : '';
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.hidden
  visibility: hidden

.nav
  align-items: center
  display: flex
  justify-content: center

  a
    width: 7em;
</style>
