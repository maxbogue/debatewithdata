<template>
<div :class="historyClasses">
  <template v-if="data && !revId">
    <h3 class="center">
      History for {{ $route.params.type }}
      <router-link :to="urlWithTrail"
                   class="mono click-text">{{ itemId }}</router-link>
    </h3>
    <ul class="mono">
      <li v-for="rev in revs" :key="rev.revId">
        <router-link :to="revUrl(rev)"
                     class="click-text">{{ rev.revId }}</router-link>
        <span>
          at
          <span :class="$style.timestamp">{{ rev.createdAt | timestamp }}</span>
        </span>
        <span>
          by
          <router-link :to="'/user/' + rev.username"
                       :class="$style.username"
                       class="click-text"
                       >{{ rev.username }}</router-link>
        </span>
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
</div>
</template>

<script>
import dateFormat from 'dateformat';

import ClaimRev from '@/components/ClaimRev.vue';
import RevNav from '@/components/RevNav.vue';
import SourceRev from '@/components/SourceRev.vue';
import TopicRev from '@/components/TopicRev.vue';
import { ItemType } from '@/common/constants';

export default {
  components: {
    ClaimRev,
    RevNav,
    SourceRev,
    TopicRev,
  },
  filters: {
    timestamp(isoDate) {
      const date = new Date(isoDate);
      return dateFormat(date, 'yyyy-mm-dd HH:MM');
    },
  },
  metaInfo() {
    const { type, id } = this.$route.params;
    return {
      title: `History for ${type} ${id}`,
    };
  },
  data: () => ({
    ItemType,
    data: null,
  }),
  computed: {
    itemType() {
      const type = this.$route.params.type;
      return type === 'data' ? ItemType.SOURCE : type;
    },
    itemId() {
      return this.$route.params.id;
    },
    revId() {
      return this.$route.params.revId;
    },
    revs() {
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
    historyClasses() {
      const itemTypeClass = {
        [ItemType.TOPIC]: this.$style.topicHistory,
        [ItemType.CLAIM]: this.$style.claimHistory,
        [ItemType.SOURCE]: this.$style.sourceHistory,
      }[this.itemType];
      return [
        this.$style.history,
        itemTypeClass,
        { narrow: this.data && !this.revId },
      ];
    },
    revIndex() {
      return this.revs.findIndex(r => r.revId === this.revId);
    },
    curr() {
      return this.revs[this.revIndex];
    },
    prev() {
      return this.revs[this.revIndex + 1];
    },
    next() {
      return this.revs[this.revIndex - 1];
    },
    trail() {
      return this.parseTrail(this.$route.query.trail);
    },
    newTrail() {
      return this.trail.concat(this.itemId);
    },
    url() {
      return this.itemUrl(this.itemType, this.itemId);
    },
    urlWithTrail() {
      return this.itemUrl(this.itemType, this.itemId, this.trail);
    },
  },
  watch: {
    id() {
      this.loadData();
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    revUrl(rev) {
      return this.appendToUrl(this.urlWithTrail, '/rev/' + rev.revId);
    },
    async loadData() {
      this.data = null;
      this.data = await this.$store.dispatch('getItemRevs', {
        type: this.itemType,
        id: this.itemId,
      });
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.timestamp {
  color: $text-dark-accent;
  font-size: 0.8em;
}

.history {
  ul {
    margin: 1rem 0;
    padding: 0;
  }

  li {
    padding: 6px 8px;
    list-style: none;

    > * {
      white-space: nowrap;
    }
  }
}

.topicHistory {
  :global(.click-text) {
    color: $pink-dark-primary;
  }

  li:nth-child(odd) {
    background-color: $pink-primary;
  }
}

.claimHistory {
  :global(.click-text) {
    color: $blue-dark-primary;
  }

  li:nth-child(odd) {
    background-color: $blue-primary;
  }
}

.sourceHistory {
  :global(.click-text) {
    color: $green-dark-primary;
  }

  li:nth-child(odd) {
    background-color: $green-primary;
  }
}
</style>
