<template>
<form-valid class="source"
            @submit="close"
            @keydown.native.enter="close"
            @keydown.native.esc="cancel">
  <source-edit-content class="bubble"
                       :source="source"
                       @update:source="update" />
  <div class="info">
    <div class="id mono">{{ id || 'new' }}</div>
    <button type="button"
            class="dwd-btn white"
            @click="cancel">Cancel</button>
    <button type="submit"
            class="dwd-btn green-dark">Review</button>
    <div class="controls"></div>
  </div>
</form-valid>
</template>

<script>
import clone from 'lodash/clone';

import FormValid from './FormValid.vue';
import SourceEditContent from './SourceEditContent.vue';

export default {
  components: {
    FormValid,
    SourceEditContent,
  },
  props: {
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
  mounted: function () {
    if (this.source) {
      this.oldSource = clone(this.source);
    }
  },
  methods: {
    update: function (newSource) {
      this.$emit('update:source', newSource);
    },
    close: function () {
      this.$emit('close');
    },
    cancel: function () {
      this.close();
      this.update(this.oldSource);
    },
  },
};
</script>
