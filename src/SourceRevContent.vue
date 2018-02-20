<template>
<div>
  <div v-html="textDiff"></div>
  <div :class="$style.metadata">
    <div v-if="dateDiff" v-html="dateDiff"></div>
    <div v-if="safePrev.type === 'article' && safeCurr.type === 'article'">
      <strong>Article in:</strong> <span v-html="publicationDiff"></span>
    </div>
    <template v-else>
      <div v-if="safePrev.type === 'article'" class="del">
        <strong>Article in:</strong> {{ safePrev.publication }}
      </div>
      <div v-if="safeCurr.type === 'article'" class="ins">
        <strong>Article in:</strong> {{ safeCurr.publication }}
      </div>
    </template>

    <div v-if="safePrev.type === 'authority' && safeCurr.type === 'authority'">
      <strong>Authority:</strong> <span v-html="institutionDiff"></span>
    </div>
    <template v-else>
      <div v-if="safePrev.type === 'authority'" class="del">
        <strong>Authority:</strong> {{ safePrev.institution }}
      </div>
      <div v-if="safeCurr.type === 'authority'" class="ins">
        <strong>Authority:</strong> {{ safeCurr.institution }}
      </div>
    </template>

    <template v-if="safePrev.type === 'research'
                    && safeCurr.type === 'research'">
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
      <div v-if="safePrev.type === 'research'" class="del">
        <div><strong>Research by:</strong> {{ safePrev.institution }}</div>
        <div><strong>Published in:</strong> {{ safePrev.publication }}</div>
      </div>
      <div v-if="safeCurr.type === 'research'" class="ins">
        <div><strong>Research by:</strong> {{ safeCurr.institution }}</div>
        <div><strong>Published in:</strong> {{ safeCurr.publication }}</div>
      </div>
    </template>

    <div v-html="urlDiff" :class="$style.url"></div>
  </div>
</div>
</template>

<script>
import { diff } from './utils';

const EMPTY_SOURCE = {
  url: '',
  text: '',
  date: '',
  type: 'misc',
};

export default {
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  computed: {
    safeCurr: function () {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_SOURCE;
      }
      return this.curr;
    },
    safePrev: function () {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_SOURCE;
      }
      return this.prev;
    },
    textDiff: function () {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
    urlDiff: function () {
      return diff(this.safePrev.url, this.safeCurr.url);
    },
    dateDiff: function () {
      return diff(this.safePrev.date || '', this.safeCurr.date || '');
    },
    publicationDiff: function () {
      return diff(this.safePrev.publication || '',
          this.safeCurr.publication || '');
    },
    institutionDiff: function () {
      return diff(this.safePrev.institution || '',
          this.safeCurr.institution || '');
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.metadata
  color: $text-dark-accent
  font-size: 0.8em

  .url
    color: $text-dark-accent

  strong
    color: $text-dark
</style>
