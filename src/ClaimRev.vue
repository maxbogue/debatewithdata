<template>
<div>
  <div class="block no-pad center">
    <h3 class="mono">{{ curr.id }}</h3>
    <div>
        <strong>by</strong> <span>{{ curr.username }}</span>
    </div>
    <div><strong>created</strong> {{ curr.createdAt | timestamp }}</div>
    <div :class="$style.nav">
      <router-link v-if="prev" :to="prevUrl">Prev</router-link>
      <router-link :to="url + '/history'">History</router-link>
      <router-link v-if="next" :to="nextUrl">Next</router-link>
    </div>
  </div>
  <claim-rev-content class="claim block" :curr="curr" :prev="prev" />
  <template v-if="$store.state.singleColumn">
    <point-rev v-for="[[currId, prevId], side] in zippedPointRevs"
               :currId="currId"
               :prevId="prevId"
               :pointRevs="data.pointRevs"
               :isFor="!side"
               :key="currId" />
  </template>
  <template v-else>
    <div v-for="(sidePointRevs, side) in pointRevs"
         class="dwd-col"
         :key="'side-' + side">
      <point-rev v-for="[currId, prevId] in sidePointRevs"
                 :currId="currId"
                 :prevId="prevId"
                 :pointRevs="data.pointRevs"
                 :isFor="!side"
                 :key="currId" />
    </div>
  </template>
</div>
</template>

<script>
import dateFormat from 'dateformat';
import partition from 'lodash/partition';

import ClaimRevContent from './ClaimRevContent.vue';
import PointRev from './PointRev.vue';
import { rotateWithIndexes } from './utils';

export default {
  components: {
    ClaimRevContent,
    PointRev,
  },
  props: {
    claimId: {
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
      return this.data.claimRevs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.data.claimRevs[this.revIndex];
    },
    prev: function () {
      return this.data.claimRevs[this.revIndex + 1];
    },
    next: function () {
      return this.data.claimRevs[this.revIndex - 1];
    },
    url: function () {
      return this.claimUrl(this.claimId);
    },
    prevUrl: function () {
      return this.url + '/rev/' + this.prev.id;
    },
    nextUrl: function () {
      return this.url + '/rev/' + this.next.id;
    },
    pointRevs: function () {
      let pointRevs = [];
      for (let i of [0, 1]) {
        let currPoints = this.curr ? this.curr.points[i] : {};
        let prevPoints = this.prev ? this.prev.points[i] : {};

        let inPrev = (id) => prevPoints[id];
        let isModified = (id) => currPoints[id] !== prevPoints[id];

        let [inBoth, added] = partition(Object.keys(currPoints), inPrev);
        let removed = Object.keys(prevPoints).filter((id) => !currPoints[id]);
        let [modified, unmodified] = partition(inBoth, isModified);

        added.sort();
        removed.sort();
        modified.sort();
        unmodified.sort();
        let pointIds = added.concat(removed, modified, unmodified);

        pointRevs.push(pointIds.map((id) => [currPoints[id], prevPoints[id]]));
      }
      return pointRevs;
    },
    zippedPointRevs: function () {
      return rotateWithIndexes(this.points);
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
  display: flex
  justify-content: center
  padding: 8px 0 0 0

  a
    background-color: $text-light-accent
    border-left: $accent-border-width solid $text-dark-accent
    color: $text-light
    display: inline-block;
    padding: 4px;
    width: 75px;

    &:not(:first-child)
      margin-left: $accent-border-width

    &:hover
      background-color: $text-dark-accent
      text-decoration: none
</style>
