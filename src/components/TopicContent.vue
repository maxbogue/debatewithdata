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
      <dwd-markdown :text="topic.text" />
    </template>
  </template>
  <em v-else class="error">{{ errorMessage }}</em>
</div>
</template>

<script>
import ChildCount from './ChildCount.vue';
import DwdMarkdown from './DwdMarkdown.vue';
import { itemErrorMessage } from '../utils';

export default {
  components: {
    ChildCount,
    DwdMarkdown,
  },
  props: {
    topic: { type: Object, required: true },
    abbreviated: { type: Boolean, default: false },
    isLink: { type: Boolean, default: false },
  },
  computed: {
    errorMessage() {
      return itemErrorMessage(this.topic);
    },
  },
};
</script>
