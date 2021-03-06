<template>
  <div>
    <label for="title" class="hint"> The title of this topic. </label>
    <dwd-input
      v-model="title"
      id="title"
      placeholder="title"
      :validate="validate.title"
      :focus="true"
    />
    <template v-if="!oldId">
      <label for="id" class="hint">
        The ID shows up in the URL and cannot be changed.
      </label>
      <dwd-input
        v-model="id"
        id="id"
        class="mono"
        placeholder="id"
        :validate="validate.id"
      />
    </template>
    <label for="text" class="hint"> Describe this topic. </label>
    <dwd-input
      v-model="text"
      id="text"
      placeholder="description"
      allow-newlines
      :validate="validate.text"
    />
  </div>
</template>

<script>
import dashify from 'dashify';

import { validateTopic } from '@/common/validate';

import DwdInput from './DwdInput.vue';

function fixWhitespace(text) {
  const paragraphs = text.split(/\s*\n\s*\n\s*/);
  return paragraphs.map(p => p.replace(/(\s)\s*/g, ' ')).join('\n\n');
}

export default {
  components: {
    DwdInput,
  },
  props: {
    topic: { type: Object, default: null },
    oldId: { type: String, default: '' },
  },
  data: () => ({
    id: '',
    title: '',
    text: '',
    validate: validateTopic,
  }),
  computed: {
    newTopic() {
      const topic = {
        id: this.oldId || this.id,
        title: this.title,
        text: fixWhitespace(this.text),
      };
      return topic;
    },
  },
  watch: {
    topic() {
      if (this.show) {
        this.initialize();
      }
    },
    newTopic() {
      this.$emit('update', this.newTopic);
    },
    title(newTitle, oldTitle) {
      const oldId = dashify(oldTitle);
      const newId = dashify(newTitle);
      if (!this.id || this.id === oldId) {
        this.id = newId;
      }
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.topic) {
        this.id = this.topic.id || '';
        this.title = this.topic.title;
        this.text = this.topic.text;
      }
    },
  },
};
</script>
