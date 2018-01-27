<template>
<div>
  <source-rev-content class="source block" :curr="curr" :prev="prev" />
</div>
</template>

<script>
import SourceRevContent from './SourceRevContent.vue';

export default {
  components: {
    SourceRevContent,
  },
  props: {
    sourceId: {
      type: String,
      required: true,
    },
    revId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    revIndex: function () {
      return this.data.sourceRevs.findIndex((r) => r.id === this.revId);
    },
    curr: function () {
      return this.data.sourceRevs[this.revIndex];
    },
    prev: function () {
      return this.data.sourceRevs[this.revIndex + 1];
    },
  },
};
</script>
