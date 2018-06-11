<template>
<div>
  <h2>Notifications</h2>
  <dwd-loader ref="loader" />
  <template v-if="results">
    <item-block v-for="{ type, item } in results"
                :key="item.id"
                :type="type"
                :item="item"
                is-link
                abbreviated
                mini />
    <div v-if="results.length === 0"
         class="block no-pad">All caught up!</div>
  </template>
</div>
</template>

<script>
import DwdLoader from '../DwdLoader.vue';
import ItemBlock from '../ItemBlock.vue';

export default {
  components: {
    DwdLoader,
    ItemBlock,
  },
  data: () => ({
    results: null,
  }),
  mounted: function () {
    let loader = this.$refs.loader;
    this.$store.dispatch('getNotifications', { loader }).then((results) => {
      this.results = results.map(this.lookupItemWithType);
    });
  },
};
</script>
