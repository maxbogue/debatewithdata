<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="topic t1">
    <div class="bubble">
      <label for="title" class="hint">
        The title of this topic.
      </label>
      <textarea id="title"
                rows="1"
                autocomplete="off"
                placeholder="title"
                v-model="title"
                @keydown.enter.prevent
                v-auto-resize
                autofocus></textarea>
      <template v-if="!oldId">
        <label for="id" class="hint">
          The ID shows up in the URL and cannot be changed.
        </label>
        <textarea id="id"
                  class="mono"
                  rows="1"
                  autocomplete="off"
                  placeholder="id"
                  v-model="id"
                  @keydown.enter.prevent
                  v-auto-resize></textarea>
      </template>
      <label for="text" class="hint">
        Describe this topic.
      </label>
      <textarea id="text"
                rows="1"
                autocomplete="off"
                placeholder="description"
                v-model="text"
                @keydown.enter.prevent
                v-auto-resize></textarea>
    </div>
    <div v-if="text" class="info">
      <span class="id mono">{{ oldId || 'new' }}</span>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import dashify from 'dashify';

import DwdModal from './DwdModal.vue';

export default {
  components: {
    DwdModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    topic: {
      type: Object,
    },
  },
  data: () => ({
    id: '',
    title: '',
    text: '',
  }),
  computed: {
    oldId: function () {
      if (this.topic && this.topic.id) {
        return this.topic.id;
      }
      return null;
    },
    newTopic: function () {
      let topic = {
        title: this.title,
        text: this.text,
      };
      if (!this.oldId) {
        topic.id = this.id;
      }
      return topic;
    },
  },
  methods: {
    close: function () {
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.close();
      this.initialize();
      this.update();
    },
    initialize: function () {
      if (this.topic) {
        this.title = this.topic.title;
        this.text = this.topic.text;
      }
    },
  },
  watch: {
    topic: function () {
      this.initialize();
    },
    newTopic: function () {
      this.$emit('update', this.newTopic);
    },
    title: function (newTitle, oldTitle) {
      let oldId = dashify(oldTitle);
      let newId = dashify(newTitle);
      if (!this.id || this.id === oldId) {
        this.id = newId;
      }
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>
