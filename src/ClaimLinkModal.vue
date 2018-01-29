<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <item-link-input class="claim block"
                   :id.sync="id"
                   :allowClaim="true"
                   @itemType="updateIsValid" />
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
    show: {
      type: Boolean,
      required: true,
    },
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
      this.isValid = itemType === 'claim';
    },
  },
};
</script>
