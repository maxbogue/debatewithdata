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
        <template v-if="source.type === SourceType.ARTICLE">
          <div><strong>Article in:</strong> {{ source.publication }}</div>
        </template>
        <template v-else-if="source.type === SourceType.AUTHORITY">
          <div><strong>Authority:</strong> {{ source.institution }}</div>
        </template>
        <template v-else-if="source.type === SourceType.RESEARCH">
          <div><strong>Research by:</strong> {{ source.institution }}</div>
          <div><strong>Published in:</strong> {{ source.publication }}</div>
        </template>
      </template>
      <a :href="source.url" target="_blank" @click.stop>{{ source.url }}</a>
    </div>
    <template v-if="!abbreviated">
      <source-chart v-if="source.chart"
                    :chart="source.chart"
                    :table="source.table" />
      <source-table v-else-if="source.table" :table="source.table" />
    </template>
  </template>
</div>
</template>

<script>
import SourceChart from './SourceChart.vue';
import SourceTable from './SourceTable.vue';
import { itemErrorMessage } from './utils';
import { SourceType } from '../common/constants';

export default {
  components: {
    SourceChart,
    SourceTable,
  },
  props: {
    source: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
  },
  data: () => ({
    SourceType,
  }),
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

    &:hover {
      text-decoration: underline;
    }
  }

  strong {
    color: $text-dark;
  }
}
</style>
