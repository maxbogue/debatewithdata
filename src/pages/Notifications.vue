<template>
  <div>
    <h2>
      Notifications
      <button
        class="dwd-btn dwd-btn-primary"
        :class="$style.markRead"
        :disabled="!hasNotifications"
        @click="markRead"
      >
        Mark Read
      </button>
    </h2>
    <ul v-if="items" :class="$style.activity">
      <li
        v-for="{ type, item } in items"
        :key="item.id"
        :class="{ [$style.read]: isItemRead(item) }"
      >
        <div :class="$style.timestamp">{{ item.updatedAt | timestamp }}</div>
        <item-block
          :class="$style.item"
          :type="type"
          :item="item"
          is-link
          abbreviated
          mini
        />
      </li>
      <li v-if="items.length === 0" class="block no-pad">All caught up!</li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ItemBlock from '@/components/ItemBlock.vue';
import { any } from '@/common/utils';

export default {
  components: {
    ItemBlock,
  },
  metaInfo: {
    title: 'Notifications',
  },
  data: () => ({
    until: null,
    readUntil: null,
    items: null,
  }),
  computed: {
    ...mapState(['hasNotifications']),
  },
  async mounted() {
    const results = await this.$store.dispatch('getNotifications');
    this.until = results.until;
    this.readUntil = results.readUntil;
    this.items = results.items.map(this.lookupItemWithType);
    const hasNotifications = any(
      this.items,
      ({ item }) => !this.isItemRead(item)
    );
    this.$store.commit('setHasNotifications', hasNotifications);
  },
  methods: {
    isItemRead(item) {
      return item.updatedAt < this.readUntil;
    },
    async markRead() {
      await this.$store.dispatch('readNotifications', { until: this.until });
      this.readUntil = this.until;
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.markRead {
  font-size: 1rem;
  font-weight: $font-weight-normal;
  vertical-align: text-bottom;
}

.read {
  opacity: 0.5;
}

.activity {
  padding: 0;

  li {
    display: flex;
    margin-top: $mini-block-spacing;

    .timestamp {
      margin-right: $mini-block-spacing;
      font-size: 0.8em;
    }

    .item {
      flex: 1;
      margin: 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
