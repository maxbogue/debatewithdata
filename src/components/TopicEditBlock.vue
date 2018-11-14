<template>
  <form-valid class="topic" @submit="close" @keydown.native.esc="cancel">
    <topic-edit-content
      class="bubble"
      :topic="topic"
      :old-id="oldId"
      @update="update"
    />
    <div class="info">
      <div class="id mono">{{ oldId || 'new' }}</div>
      <button type="button" class="dwd-btn white" @click="cancel">
        Cancel
      </button>
      <button type="submit" class="dwd-btn pink-dark">Review</button>
      <div class="controls"></div>
    </div>
  </form-valid>
</template>

<script>
import clone from 'lodash/fp/clone';

import FormValid from './FormValid.vue';
import TopicEditContent from './TopicEditContent.vue';

export default {
  components: {
    FormValid,
    TopicEditContent,
  },
  props: {
    topic: { type: Object, default: null },
    oldId: { type: String, default: '' },
  },
  data: () => ({
    oldTopic: null,
  }),
  mounted() {
    if (this.topic) {
      this.oldTopic = clone(this.topic);
    }
  },
  methods: {
    update(newTopic) {
      this.$emit('update:topic', newTopic);
    },
    close() {
      this.$emit('close');
    },
    cancel() {
      this.close();
      this.update(this.oldTopic);
    },
  },
};
</script>
