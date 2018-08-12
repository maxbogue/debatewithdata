<template>
<div>
  <div v-html="textDiff"></div>
  <div :class="$style.metadata">
    <div v-if="dateDiff" v-html="dateDiff"></div>
    <div v-if="safePrev.type === SourceType.ARTICLE
               && safeCurr.type === SourceType.ARTICLE">
      <strong>Article in:</strong> <span v-html="publicationDiff"></span>
    </div>
    <template v-else>
      <div v-if="safePrev.type === SourceType.ARTICLE" class="del">
        <strong>Article in:</strong> {{ safePrev.publication }}
      </div>
      <div v-if="safeCurr.type === SourceType.ARTICLE" class="ins">
        <strong>Article in:</strong> {{ safeCurr.publication }}
      </div>
    </template>

    <div v-if="safePrev.type === SourceType.AUTHORITY
               && safeCurr.type === SourceType.AUTHORITY">
      <strong>Authority:</strong> <span v-html="institutionDiff"></span>
    </div>
    <template v-else>
      <div v-if="safePrev.type === SourceType.AUTHORITY" class="del">
        <strong>Authority:</strong> {{ safePrev.institution }}
      </div>
      <div v-if="safeCurr.type === SourceType.AUTHORITY" class="ins">
        <strong>Authority:</strong> {{ safeCurr.institution }}
      </div>
    </template>

    <template v-if="safePrev.type === SourceType.RESEARCH
                    && safeCurr.type === SourceType.RESEARCH">
      <div>
        <strong>Research by:</strong>
        <span v-html="institutionDiff"></span>
      </div>
      <div>
        <strong>Published in:</strong>
        <span v-html="publicationDiff"></span>
      </div>
    </template>
    <template v-else>
      <div v-if="safePrev.type === SourceType.RESEARCH" class="del">
        <div><strong>Research by:</strong> {{ safePrev.institution }}</div>
        <div><strong>Published in:</strong> {{ safePrev.publication }}</div>
      </div>
      <div v-if="safeCurr.type === SourceType.RESEARCH" class="ins">
        <div><strong>Research by:</strong> {{ safeCurr.institution }}</div>
        <div><strong>Published in:</strong> {{ safeCurr.publication }}</div>
      </div>
    </template>

    <div v-html="urlDiff" :class="$style.url"></div>
  </div>
  <source-table-diff :curr="safeCurr.table" :prev="safePrev.table" />
  <source-chart v-if="safeCurr.chart && !safePrev.chart"
                :table="safeCurr.table"
                :chart="safeCurr.chart"
                class="ins" />
  <source-chart v-if="!safeCurr.chart && safePrev.chart"
                :table="safePrev.table"
                :chart="safePrev.chart"
                class="del" />
</div>
</template>

<script>
import SourceTableDiff from './SourceTableDiff.vue';
import { diff } from '../utils';
import { SourceType } from '../common/constants';

const SourceChart = () =>
  import(/* webpackChunkName: "chart" */ './SourceChart.vue');

const EMPTY_SOURCE = {
  url: '',
  text: '',
  date: '',
  type: SourceType.MISC,
};

export default {
  components: {
    SourceChart,
    SourceTableDiff,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  data: () => ({
    SourceType,
  }),
  computed: {
    safeCurr() {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_SOURCE;
      }
      return this.curr;
    },
    safePrev() {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_SOURCE;
      }
      return this.prev;
    },
    textDiff() {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
    urlDiff() {
      return diff(this.safePrev.url, this.safeCurr.url);
    },
    dateDiff() {
      return diff(this.safePrev.date || '', this.safeCurr.date || '');
    },
    publicationDiff() {
      return diff(this.safePrev.publication || '',
                  this.safeCurr.publication || '');
    },
    institutionDiff() {
      return diff(this.safePrev.institution || '',
                  this.safeCurr.institution || '');
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.metadata {
  color: $text-dark-accent;
  font-size: 0.8em;

  .url {
    color: $text-dark-accent;
  }

  strong {
    color: $text-dark;
  }
}
</style>
