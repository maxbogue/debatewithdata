<template>
<div>
  <template v-if="topic && !topic.deleted">
    <h2>{{ topic.title }}</h2>
    <div>{{ topic.text }}</div>
  </template>
  <em v-else class="error">{{ errorMessage }}</em>
</div>
</template>

<script>
import { itemErrorMessage } from './utils';

export default {
  props: {
    topic: { type: Object, required: true },
  },
  computed: {
    errorMessage: function () {
      return itemErrorMessage(this.topic);
    },
  },
};
</script>
