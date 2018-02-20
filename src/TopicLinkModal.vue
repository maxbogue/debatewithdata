<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="topic">
    <item-link-input class="bubble"
                     v-model="id"
                     allow-topic
                     @itemType="updateIsValid" />
    <div class="info">
      <button type="submit"
              class="dwd-btn pink-dark">Link</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';

export default {
  components: {
    DwdModal,
    ItemLinkInput,
  },
  props: {
    show: { type: Boolean, required: true },
  },
  data: () => ({
    id: '',
    isValid: false,
  }),
  methods: {
    close: function () {
      if (this.isValid) {
        this.$emit('update', this.id);
      }
      this.$emit('update:show', false);
      this.id = '';
    },
    cancel: function () {
      this.isValid = false;
      this.close();
    },
    updateIsValid: function (itemType) {
      this.isValid = itemType === 'topic';
    },
  },
};
</script>
