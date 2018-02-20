<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="topic">
    <div class="bubble">
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
    <div v-if="text" class="info">
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
import dashify from 'dashify';

import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import { validateTopic } from '../common/validate';

export default {
  components: {
    DwdInput,
    DwdModal,
  },
  props: {
    show: { type: Boolean, required: true },
    topic: { type: Object, default: null },
    oldId: { type: String, default: '' },
  },
  data: () => ({
    id: '',
    title: '',
    text: '',
    oldTopic: null,
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
    show: function () {
      if (this.show) {
        this.initialize();
      }
    },
    newTopic: function () {
      this.$emit('update:topic', this.newTopic);
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
        this.title = this.topic.title;
        this.text = this.topic.text;
      }
    },
  },
};
</script>
