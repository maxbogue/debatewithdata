<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="topic">
    <topic-edit-content class="bubble"
                        :topic="topic"
                        :old-id="oldId"
                        @update="update" />
    <div class="info">
      <div class="id mono">{{ oldId || 'new' }}</div>
      <button type="submit"
              class="dwd-btn pink-dark">Apply</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <div class="controls"></div>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import clone from 'lodash/clone';

import DwdModal from './DwdModal.vue';
import TopicEditContent from './TopicEditContent.vue';

export default {
  components: {
    DwdModal,
    TopicEditContent,
  },
  props: {
    show: { type: Boolean, required: true },
    topic: { type: Object, default: null },
    oldId: { type: String, default: '' },
  },
  data: () => ({
    oldTopic: null,
  }),
  watch: {
    show: function () {
      if (this.show) {
        this.initialize();
      }
    },
  },
  mounted: function () {
    this.initialize();
  },
  methods: {
    update: function (newTopic) {
      this.$emit('update:topic', newTopic);
    },
    close: function () {
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.close();
      this.$emit('update:topic', this.oldTopic);
    },
    initialize: function () {
      if (this.topic) {
        this.oldTopic = clone(this.topic);
      }
    },
  },
};
</script>
