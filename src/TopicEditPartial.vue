<template>
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
              v-auto-resize></textarea>
    <template v-if="!oldId">
      <label for="id" class="hint">
        The ID shows up in the URL and cannot be changed.
      </label>
      <textarea id="id"
                class="mono"
                rows="1"
                autocomplete="off"
                placeholder="id"
                v-model="tempId"
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
              v-auto-resize></textarea>
  </div>
  <div v-if="text" class="info">
    <span class="id mono">{{ oldId || 'new' }}</span>
  </div>
</div>
</template>

<script>
import dashify from 'dashify';

export default {
  props: {
    oldTopic: {
      type: Object,
    },
  },
  data: function () {
    return {
      tempId: '',
      title: '',
      text: '',
    };
  },
  computed: {
    oldId: function () {
      if (this.oldTopic && this.oldTopic.id) {
        return this.oldTopic.id;
      }
      return null;
    },
  },
  methods: {
    update: function () {
      let topic = {
        title: this.title,
        text: this.text,
      };
      if (!this.oldId) {
        topic.id = this.tempId;
      }
      this.$emit('update', topic);
    },
    initialize: function () {
      if (this.oldTopic) {
        this.title = this.oldTopic.title;
        this.text = this.oldTopic.text;
      }
    },
  },
  watch: {
    oldTopic: function () {
      this.initialize();
    },
    tempId: function () {
      this.update();
    },
    title: function (newTitle, oldTitle) {
      let oldId = dashify(oldTitle);
      let newId = dashify(newTitle);
      if (!this.tempId || this.tempId === oldId) {
        this.tempId = newId;
      }
      this.update();
    },
    text: function () {
      this.update();
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>
