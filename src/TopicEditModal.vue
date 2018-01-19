<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="topic t1">
    <div class="bubble">
      <label for="title" class="hint">
        The title of this topic.
      </label>
      <dwd-input v-model="title"
                 id="title"
                 placeholder="title"
                 autofocus />
      <template v-if="!oldId">
        <label for="id" class="hint">
          The ID shows up in the URL and cannot be changed.
        </label>
        <dwd-input v-model="id"
                   id="id"
                   class="mono"
                   placeholder="id" />
      </template>
      <label for="text" class="hint">
        Describe this topic.
      </label>
      <dwd-input v-model="text"
                 id="text"
                 placeholder="description" />
    </div>
    <div v-if="text" class="info">
      <span class="id mono">{{ oldId || 'new' }}</span>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import dashify from 'dashify';

import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';

export default {
  components: {
    DwdInput,
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
