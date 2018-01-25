<template>
<div>
  <div class="block no-pad center">
    <h3 class="mono">{{ curr.id }}</h3>
    <div>
        <strong>by</strong> <span>{{ curr.username }}</span>
    </div>
    <div><strong>created</strong> {{ curr.createdAt | timestamp }}</div>
  </div>
  <div class="block no-pad center" :class="$style.nav">
    <router-link v-if="prev"
                 :to="prevUrl"
                 class="dwd-btn grey">Prev</router-link>
    <router-link :to="url + '/history'"
                 class="dwd-btn grey">History</router-link>
    <router-link v-if="next"
                 :to="nextUrl"
                 class="dwd-btn grey">Next</router-link>
  </div>
  <source-rev-content class="source block" :curr="curr" :prev="prev" />
</div>
</template>

<script>
import dateFormat from 'dateformat';

import SourceRevContent from './SourceRevContent.vue';

export default {
  components: {
    SourceRevContent,
  },
  props: {
    sourceId: {
      type: String,
      required: true,
    },
    revId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    revIndex: function () {
      return this.data.sourceRevs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.data.sourceRevs[this.revIndex];
    },
    prev: function () {
      return this.data.sourceRevs[this.revIndex + 1];
    },
    next: function () {
      return this.data.sourceRevs[this.revIndex - 1];
    },
    url: function () {
      return this.sourceUrl(this.sourceId);
    },
    prevUrl: function () {
      return this.url + '/rev/' + this.prev.id;
    },
    nextUrl: function () {
      return this.url + '/rev/' + this.next.id;
    },
  },
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.nav
  align-items: center
  display: flex
  justify-content: center
  padding: 8px 0 0 0

  a
    width: 7em;

    &:not(:first-child)
      margin-left: $accent-border-width
</style>
