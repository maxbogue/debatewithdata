<template>
<div>
  <h2 v-html="titleDiff"></h2>
  <div v-html="textDiff"></div>
</div>
</template>

<script>
import { diff } from './utils';

const EMPTY_TOPIC = {
  title: '',
  text: '',
};

export default {
  props: {
    curr: Object,
    prev: Object,
  },
  computed: {
    safeCurr: function () {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_TOPIC;
      }
      return this.curr;
    },
    safePrev: function () {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_TOPIC;
      }
      return this.prev;
    },
    titleDiff: function () {
      return diff(this.safePrev.title, this.safeCurr.title);
    },
    textDiff: function () {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
  },
};
</script>
