<template>
<div>
  <dwd-flag v-if="curr.flag && curr.flag === prev.flag" :flag="curr.flag" />
  <template v-else>
    <dwd-flag v-if="prev.flag" :flag="prev.flag" class="del" />
    <dwd-flag v-if="curr.flag" :flag="curr.flag" class="ins" />
  </template>
  <span v-html="diff(prev.text, curr.text)"></span>
</div>
</template>

<script>
import Diff from 'text-diff';

import DwdFlag from './DwdFlag.vue';

const diff = new Diff();

export default {
  components: {
    DwdFlag,
  },
  props: {
    curr: {
      type: Object,
      default: () => ({
        text: '',
      }),
    },
    prev: {
      type: Object,
      default: () => ({
        text: '',
      }),
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
