<template>
<div>
  <div>
    <span v-if="sourceHasContent">{{ source.text }}</span>
    <em v-else class="error">{{ errorMessage }}</em>
  </div>
  <template v-if="sourceHasContent">
    <div :class="$style.metadata">
      <template v-if="!abbreviated">
        <div v-if="source.date">{{ source.date }}</div>
        <template v-if="source.type === 'article'">
          <div><strong>Article in:</strong> {{ source.publication }}</div>
        </template>
        <template v-else-if="source.type === 'authority'">
          <div><strong>Authority:</strong> {{ source.institution }}</div>
        </template>
        <template v-else-if="source.type === 'research'">
          <div><strong>Research by:</strong> {{ source.institution }}</div>
          <div><strong>Published in:</strong> {{ source.publication }}</div>
        </template>
      </template>
      <a :href="source.url" target="_blank">{{ source.url }}</a>
    </div>
    <source-table v-if="!abbreviated && source.table" :table="source.table" />
  </template>
</div>
</template>

<script>
import SourceTable from './SourceTable.vue';
import { itemErrorMessage } from './utils';

export default {
  components: {
    SourceTable,
  },
  props: {
    source: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
  },
  computed: {
    sourceHasContent: function () {
      return this.source && !this.source.deleted;
    },
    errorMessage: function () {
      return itemErrorMessage(this.source);
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.metadata {
  color: $text-dark-accent;
  font-size: 0.8em;

  a {
    color: $text-dark-accent;
  }

  strong {
    color: $text-dark;
  }
}
</style>
