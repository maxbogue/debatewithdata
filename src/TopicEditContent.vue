<template>
<div>
  <label for="title" class="hint">
    The title of this topic.
  </label>
  <dwd-input v-model="title"
             id="title"
             placeholder="title"
             :validate="validate.title"
             :focus="true" />
  <template v-if="!oldId">
    <label for="id" class="hint">
      The ID shows up in the URL and cannot be changed.
    </label>
    <dwd-input v-model="id"
               id="id"
               class="mono"
               placeholder="id"
               :validate="validate.id" />
  </template>
  <label for="text" class="hint">
    Describe this topic.
  </label>
  <dwd-input v-model="text"
             id="text"
             placeholder="description"
             :validate="validate.text" />
</div>
</template>

<script>
import dashify from 'dashify';

import DwdInput from './DwdInput.vue';
import { validateTopic } from '../common/validate';

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
  watch: {
    topic: function () {
      if (this.show) {
        this.initialize();
      }
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
  methods: {
    initialize: function () {
      if (this.topic) {
        this.title = this.topic.title;
        this.text = this.topic.text;
      }
    },
  },
};
</script>
