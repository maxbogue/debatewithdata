<template>
<div>
  <dwd-flag v-if="curr.flag && curr.flag === prev.flag" :flag="curr.flag" />
  <template v-else>
    <dwd-flag v-if="prev.flag" :flag="prev.flag" class="del" />
    <dwd-flag v-if="curr.flag" :flag="curr.flag" class="ins" />
  </template>
  <span v-html="diffHtml"></span>
</div>
</template>

<script>
import Diff from 'text-diff';

import DwdFlag from './DwdFlag.vue';

const diff = new Diff();
const emptyClaim = () => ({ text: '' });

export default {
  components: {
    DwdFlag,
  },
  props: {
    curr: {
      type: Object,
      required: true,
      default: emptyClaim,
    },
    prev: {
      type: Object,
      required: true,
      default: emptyClaim,
    },
  },
  computed: {
    diffHtml: function () {
      let prevText = this.prev.text || '';
      let currText = this.curr.text || '';
      return this.diff(prevText, currText);
    },
  },
  methods: {
    diff: function (text1, text2) {
      let diffs = diff.main(text1, text2);
      diff.cleanupSemantic(diffs);
      return diff.prettyHtml(diffs);
    },
  },
};
</script>
