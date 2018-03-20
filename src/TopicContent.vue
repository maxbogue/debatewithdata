<template>
<div>
  <template v-if="topic && !topic.deleted">
    <template v-if="abbreviated">{{ topic.title }}</template>
    <template v-else>
      <h2>{{ topic.title }}</h2>
      <div>{{ topic.text }}</div>
    </template>
  </template>
  <em v-else class="error">{{ errorMessage }}</em>
</div>
</template>

<script>
import { itemErrorMessage } from './utils';

export default {
  props: {
    topic: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
  },
  computed: {
    errorMessage: function () {
      return itemErrorMessage(this.topic);
    },
  },
};
</script>
