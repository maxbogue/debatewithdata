<template>
<div>
  <dwd-flag v-if="curr.flag && curr.flag === prev.flag" :flag="curr.flag" />
  <template v-else>
    <dwd-flag v-if="prev.flag" :flag="prev.flag" class="del" />
    <dwd-flag v-if="curr.flag" :flag="curr.flag" class="ins" />
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
    curr: Object,
    prev: Object,
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
