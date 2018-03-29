<template>
<div>
  <template v-if="topic && !topic.deleted">
    <template v-if="abbreviated">
      <child-count v-if="isLink" :item="topic" />
      <span>{{ topic.title }}</span>
    </template>
    <template v-else>
      <child-count v-if="isLink" :item="topic" />
      <h2>{{ topic.title }}</h2>
      <div>{{ topic.text }}</div>
    </template>
  </template>
  <em v-else class="error">{{ errorMessage }}</em>
</div>
</template>

<script>
import ChildCount from './ChildCount.vue';
import { itemErrorMessage } from './utils';

export default {
  components: {
    ChildCount,
  },
  props: {
    topic: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
    isLink: { type: Boolean, default: false },
  },
  computed: {
    errorMessage: function () {
      return itemErrorMessage(this.topic);
    },
  },
};
</script>
