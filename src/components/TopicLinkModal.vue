<template>
  <dwd-modal :show="show" @close="close" @cancel="cancel">
    <div class="topic">
      <div class="bubble">
        <label for="title" class="hint">
          New title or search for a topic to link.
        </label>
        <item-link-input
          v-model="title"
          id="title"
          allow-topic
          placeholder="title or link"
          :validate="validate.title"
          @itemType="updateIsLink"
        />
        <template v-if="title && !isLink">
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
          <label for="text" class="hint"> Describe this topic. </label>
          <dwd-input
            v-model="text"
            id="text"
            placeholder="description"
            :validate="validate.text"
          />
        </template>
      </div>
      <div class="info">
        <button type="button" class="dwd-btn white" @click="cancel">
          Cancel
        </button>
        <button type="submit" class="dwd-btn pink-dark">Review</button>
      </div>
    </div>
  </dwd-modal>
</template>

<script>
import dashify from 'dashify';

import { ItemType } from '@/common/constants';
import { validateTopic } from '@/common/validate';

import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';

export default {
  components: {
    DwdInput,
    DwdModal,
    ItemLinkInput,
  },
  props: {
    show: { type: Boolean, required: true },
  },
  data: () => ({
    title: '',
    id: '',
    text: '',
    isLink: false,
    validate: validateTopic,
  }),
  computed: {
    newTopic() {
      if (this.isLink) {
        return null;
      }
      return {
        title: this.title,
        id: this.id,
        text: this.text,
        subTopicIds: [],
        claimIds: [],
      };
    },
  },
  watch: {
    show() {
      if (this.show) {
        this.title = '';
        this.id = '';
        this.text = '';
      }
    },
    title(newTitle, oldTitle) {
      const oldId = dashify(oldTitle);
      const newId = dashify(newTitle);
      if (!this.id || this.id === oldId) {
        this.id = newId;
      }
    },
  },
  methods: {
    close() {
      if (this.isLink) {
        this.$emit('link', this.title);
      } else {
        this.$emit('add', this.newTopic);
      }
      this.$emit('update:show', false);
    },
    cancel() {
      this.$emit('update:show', false);
    },
    updateIsLink(itemType) {
      this.isLink = itemType === ItemType.TOPIC;
    },
  },
};
</script>
