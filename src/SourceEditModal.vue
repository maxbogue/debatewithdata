<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="source">
    <source-edit-content class="bubble"
                         :source="source"
                         @update="update" />
    <div class="info">
      <div class="id mono">{{ id || 'new' }}</div>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="submit"
              class="dwd-btn green-dark">Review</button>
      <div class="controls"></div>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import clone from 'lodash/clone';

import DwdModal from './DwdModal.vue';
import SourceEditContent from './SourceEditContent.vue';

export default {
  components: {
    DwdModal,
    SourceEditContent,
  },
  props: {
    show: { type: Boolean, required: true },
    source: { type: Object, default: null },
  },
  data: () => ({
    oldSource: null,
  }),
  computed: {
    id: function () {
      if (this.oldSource && this.oldSource.id) {
        return this.oldSource.id;
      }
      return null;
    },
  },
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
    update: function (newSource) {
      this.$emit('update:source', newSource);
    },
    close: function () {
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.close();
      this.$emit('update:source', this.oldSource);
    },
    initialize: function () {
      if (this.source) {
        this.oldSource = clone(this.source);
      }
    },
  },
};
</script>
