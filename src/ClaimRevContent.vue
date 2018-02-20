<template>
<div>
  <dwd-flag v-if="safeCurr.flag && safeCurr.flag === safePrev.flag"
            :flag="safeCurr.flag" />
  <template v-else>
    <dwd-flag v-if="safePrev.flag" :flag="safePrev.flag" class="del" />
    <dwd-flag v-if="safeCurr.flag" :flag="safeCurr.flag" class="ins" />
  </template>
  <span v-html="textDiff"></span>
</div>
</template>

<script>
import DwdFlag from './DwdFlag.vue';
import { diff } from './utils';

const EMPTY_CLAIM = { text: '' };

export default {
  components: {
    DwdFlag,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  computed: {
    safeCurr: function () {
      if (!this.curr || this.curr.deleted) {
        return EMPTY_CLAIM;
      }
      return this.curr;
    },
    safePrev: function () {
      if (!this.prev || this.prev.deleted) {
        return EMPTY_CLAIM;
      }
      return this.prev;
    },
    textDiff: function () {
      return diff(this.safePrev.text, this.safeCurr.text);
    },
  },
};
</script>
