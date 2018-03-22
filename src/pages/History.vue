<template>
<div :class="{ narrow: data && !revId }">
  <template v-if="data && !revId">
    <h3 class="center">
      History for
      <router-link :to="urlWithTrail" class="mono">{{ itemId }}</router-link>
    </h3>
    <ul class="mono" :class="$style.revs">
      <li v-for="rev in revs" :class="revClass" :key="rev.revId">
        <router-link :to="revUrl(rev)">{{ rev.revId }}</router-link>
        <span :class="$style.username">{{ rev.username }}</span>
        <span>{{ rev.createdAt | timestamp }}</span>
      </li>
    </ul>
  </template>
  <template v-if="data && revId">
    <rev-nav :item-type="itemType"
             :curr="curr"
             :prev="prev"
             :next="next"
             :trail="trail" />
    <topic-rev v-if="itemType === 'topic'"
               :curr="curr"
               :prev="prev" />
    <claim-rev v-else-if="itemType === 'claim'"
               :curr="curr"
               :prev="prev" />
    <source-rev v-else-if="itemType === 'source'"
                :curr="curr"
                :prev="prev" />
    <point-rev v-else-if="itemType === 'point'"
               :curr="curr"
               :prev="prev"
               :is-for="data.isFor" />
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import axios from 'axios';
import dateFormat from 'dateformat';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';

import ClaimRev from '../ClaimRev.vue';
import PointRev from '../PointRev.vue';
import RevNav from '../RevNav.vue';
import SourceRev from '../SourceRev.vue';
import TopicRev from '../TopicRev.vue';
import DwdLoader from '../DwdLoader.vue';

function unwrapPoints(data) {
  forEach(data, (itemMap) => {
    forEach(itemMap, (item) => {
      if (!item.points) {
        return;
      }
      item.points = map(item.points, (pts) =>
        mapValues(pts, (r) => data.pointRevs[r]));
    });
  });
}

export default {
  components: {
    ClaimRev,
    PointRev,
    RevNav,
    SourceRev,
    TopicRev,
    DwdLoader,
  },
  filters: {
    timestamp: function (isoDate) {
      let date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
  data: () => ({
    data: null,
  }),
  computed: {
    itemType: function () {
      return this.$route.params.type;
    },
    itemId: function () {
      return this.$route.params.id;
    },
    revId: function () {
      return this.$route.params.revId;
    },
    revs: function () {
      if (!this.data) {
        return [];
      }
      switch (this.itemType) {
      case 'topic':
        return this.data.topicRevs;
      case 'claim':
        return this.data.claimRevs;
      case 'source':
        return this.data.sourceRevs;
      case 'point':
        return map(this.data.pointRevIds, (id) => this.data.pointRevs[id]);
      }
      return [];
    },
    revClass: function () {
      switch (this.itemType) {
      case 'topic':
        return this.$style.topicRev;
      case 'claim':
        return this.$style.claimRev;
      case 'source':
        return this.$style.sourceRev;
      case 'point':
        return this.data.isFor ? this.$style.forRev : this.$style.againstRev;
      }
      return '';
    },
    revIndex: function () {
      return this.revs.findIndex((r) => r.revId === this.revId);
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
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
    url: function () {
      return this.itemUrl(this.itemType, this.itemId);
    },
    urlWithTrail: function () {
      return this.itemUrl(this.itemType, this.itemId, this.trail);
    },
  },
  watch: {
    id: function () {
      this.loadData();
    },
  },
  mounted: function () {
    this.loadData();
  },
  methods: {
    revUrl: function (rev) {
      return this.appendToUrl(this.urlWithTrail, '/rev/' + rev.revId);
    },
    loadData: function () {
      this.data = null;
      axios.get('/api' + this.url + '/rev', {
        loader: this.$refs.loader,
      }).then((res) => {
        unwrapPoints(res.data);
        this.$store.commit('setData', res.data);
        this.data = res.data;
      });
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.revs {
  margin: 20px auto;
  padding: 0;

  li {
    display: flex;
    padding: 6px 8px;
    list-style: none;
    text-align: center;

    .username {
      flex: 1;
    }
  }

  li:nth-child(even) {
    &.topicRev {
      background-color: $pink-primary;
    }

    &.claimRev {
      background-color: $blue-primary;
    }

    &.sourceRev {
      background-color: $green-primary;
    }

    &.forRev {
      background-color: $purple-primary;
    }

    &.againstRev {
      background-color: $amber-primary;
    }
  }

  li:nth-child(odd) {
    &.topicRev {
      background-color: $pink-accent;
    }

    &.claimRev {
      background-color: $blue-accent;
    }

    &.sourceRev {
      background-color: $green-accent;
    }

    &.forRev {
      background-color: $purple-accent;
    }

    &.againstRev {
      background-color: $amber-accent;
    }
  }
}
</style>
