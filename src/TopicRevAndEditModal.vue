<template>
<div class="topic">
  <dwd-modal :show="showModal"
             @close="showModal = false">
    <topic-edit-block :topic="topic"
                      @update:topic="(t) => $emit('update', t)"
                      @close="showModal = false" />
  </dwd-modal>
  <topic-rev-content class="bubble click"
                     :curr="topic"
                     @click.native="showModal = true" />
  <div class="info">
    <span class="id mono">{{ topic.id }}</span>
    <span class="controls">
      <span class="delete click fas fa-trash-alt"
            @click="$emit('delete')"></span>
    </span>
  </div>
</div>
</template>

<script>
import TopicEditBlock from './TopicEditBlock.vue';
import TopicRevContent from './TopicRevContent.vue';
import DwdModal from './DwdModal.vue';

export default {
  components: {
    TopicEditBlock,
    TopicRevContent,
    DwdModal,
  },
  props: {
    topic: { type: Object, required: true },
  },
  data: () => ({
    showModal: false,
  }),
};
</script>
