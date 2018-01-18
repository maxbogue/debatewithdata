<template>
<div>
  <h2 v-html="diff(prev.title, curr.title)"></h2>
  <p v-html="diff(prev.text, curr.text)"></p>
</div>
</template>

<script>
import Diff from 'text-diff';

const diff = new Diff();

let emptyTopic = () => ({
  title: '',
  text: '',
});

export default {
  props: {
    curr: {
      type: Object,
      default: emptyTopic,
      required: true,
    },
    prev: {
      type: Object,
      default: emptyTopic,
      required: true,
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
