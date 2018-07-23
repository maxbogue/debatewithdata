<template>
<div>
  <h2>
    Notifications
    <button class="dwd-btn dwd-btn-primary"
            :class="$style.markRead"
            @click="markRead">Mark Read</button>
  </h2>
  <ul v-if="items" :class="$style.activity">
    <li v-for="{ type, item } in items"
        :key="item.id"
        :class="{ [$style.read]: item.updatedAt < readUntil }">
      <div :class="$style.timestamp">{{ item.updatedAt | timestamp }}</div>
      <item-block :class="$style.item"
                  :type="type"
                  :item="item"
                  is-link
                  abbreviated
                  mini />
    </li>
    <li v-if="items.length === 0"
        class="block no-pad">All caught up!</li>
  </ul>
</div>
</template>

<script>
import ItemBlock from '../components/ItemBlock.vue';

export default {
  components: {
    ItemBlock,
  },
  data: () => ({
    until: new Date().toISOString(),
    readUntil: null,
    items: null,
  }),
  mounted: async function () {
    let until = this.until;
    let results = await this.$store.dispatch('getNotifications', { until });
    this.readUntil = results.readUntil;
    this.items = results.items.map(this.lookupItemWithType);
  },
  methods: {
    markRead: async function () {
      await this.$store.dispatch('readNotifications', { until: this.until });
      this.readUntil = this.until;
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

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
