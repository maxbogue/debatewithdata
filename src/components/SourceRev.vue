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
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
  },
};
</script>
