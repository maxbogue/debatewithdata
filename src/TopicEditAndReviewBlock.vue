<template>
<div>
  <div v-if="showReviewMode" :class="$style.reviewMode">
    <span :class="{ [$style.active]: reviewMode === PREVIEW }"
          @click="reviewMode = PREVIEW"
          >Preview</span>
    |
    <span :class="{ [$style.active]: reviewMode === DIFF }"
          @click="reviewMode = DIFF"
          >Diff</span>
  </div>
  <dwd-modal v-if="useModal"
             :show="editMode"
             @close="editMode = false">
    <topic-edit-block :topic="topic"
                      @update:topic="(t) => $emit('update:topic', t)"
                      @close="editMode = false" />
  </dwd-modal>
  <topic-edit-block v-if="!useModal && editMode"
                    :topic="topic"
                    :old-id="prev ? prev.id : ''"
                    @update:topic="(t) => $emit('update:topic', t)"
                    @close="editMode = false" />
  <div v-else class="topic">
    <topic-content v-if="reviewMode === PREVIEW"
                   class="bubble click"
                   :topic="topic"
                   @click.native="editMode = true" />
    <topic-rev-content v-else
                       class="bubble click"
                       :prev="prev"
                       :curr="topic"
                       @click.native="editMode = true" />
    <div v-if="useModal" class="info">
      <span class="id mono">{{ topic.id }}</span>
      <span class="controls">
        <span class="delete click fas fa-trash-alt"
              @click="$emit('delete')"></span>
      </span>
    </div>
  </div>
</div>
</template>

<script>
import TopicContent from './TopicContent.vue';
import TopicEditBlock from './TopicEditBlock.vue';
import TopicRevContent from './TopicRevContent.vue';
import DwdModal from './DwdModal.vue';

const PREVIEW = 'preview';
const DIFF = 'diff';

export default {
  components: {
    TopicContent,
    TopicEditBlock,
    TopicRevContent,
    DwdModal,
  },
  props: {
    topic: { type: Object, required: true },
    prev: { type: Object, default: null },
    useModal: { type: Boolean, default: false },
    showEditBlock: { type: Boolean, default: false },
  },
  data: () => ({
    PREVIEW,
    DIFF,
    editMode: false,
    reviewMode: PREVIEW,
  }),
  computed: {
    noChange: function () {
      return this.prev
        && this.topic.title === this.prev.title
        && this.topic.text === this.prev.text;
    },
    showReviewMode: function () {
      return !this.editMode && !this.noChange;
    },
  },
  watch: {
    showEditBlock: function () {
      this.editMode = this.showEditBlock;
    },
    editMode: function () {
      this.$emit('update:showEditBlock', this.editMode);
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.reviewMode {
  margin: $block-spacing 0 (-$block-spacing) 0;
  cursor: default;

  span {
    &.active {
      font-weight: $font-weight-bold;
    }

    &:not(.active):hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
