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
        <router-link :to="'/user/' + rev.username"
                     :class="$style.username">{{ rev.username }}</router-link>
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
    <topic-rev v-if="itemType === ItemType.TOPIC"
               :curr="curr"
               :prev="prev"
               :trail="newTrail" />
    <claim-rev v-else-if="itemType === ItemType.CLAIM"
               :curr="curr"
               :prev="prev"
               :trail="newTrail" />
    <source-rev v-else-if="itemType === ItemType.SOURCE"
                :curr="curr"
                :prev="prev" />
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import dateFormat from 'dateformat';

import ClaimRev from '../ClaimRev.vue';
import RevNav from '../RevNav.vue';
import SourceRev from '../SourceRev.vue';
import TopicRev from '../TopicRev.vue';
import DwdLoader from '../DwdLoader.vue';
import { ItemType } from '../../common/constants';

export default {
  components: {
    ClaimRev,
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
    ItemType,
    data: null,
  }),
  computed: {
    itemType: function () {
      let type = this.$route.params.type;
      return type === 'data' ? ItemType.SOURCE : type;
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
      case ItemType.TOPIC:
        return this.data.topicRevs;
      case ItemType.CLAIM:
        return this.data.claimRevs;
      case ItemType.SOURCE:
        return this.data.sourceRevs;
      }
      return [];
    },
    revClass: function () {
      switch (this.itemType) {
      case ItemType.TOPIC:
        return this.$style.topicRev;
      case ItemType.CLAIM:
        return this.$style.claimRev;
      case ItemType.SOURCE:
        return this.$style.sourceRev;
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
    newTrail: function () {
      return this.trail.concat(this.itemId);
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
    loadData: async function () {
      this.data = null;
      let url = this.apiUrl(this.itemType, this.itemId) + '/rev';
      let res = await this.$http.get(url, { loader: this.$refs.loader });
      this.$store.commit('setData', res.data);
      this.data = res.data;
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
