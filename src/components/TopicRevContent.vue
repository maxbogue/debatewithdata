<template>
  <div>
    <h2 v-html="titleDiff"></h2>
    <div v-html="textDiff"></div>
  </div>
</template>

<script>
import { diff } from '@/utils';

const EMPTY_TOPIC = {
  title: '',
  text: '',
};

export default {
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  computed: {
    safeCurr() {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_TOPIC;
      }
      return this.curr;
    },
    safePrev() {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_TOPIC;
      }
      return this.prev;
    },
    titleDiff() {
      return diff(this.safePrev.title, this.safeCurr.title);
    },
    textDiff() {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
  },
};
</script>
