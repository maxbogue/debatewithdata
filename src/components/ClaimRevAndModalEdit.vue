<template>
  <claim-rev-block
    :curr="claim"
    can-edit
    can-delete
    @start-editing="showModal = true;"
    @delete="$emit('delete');"
  >
    <dwd-modal :show="showModal" @close="showModal = false;">
      <claim-edit-block
        :claim="claim"
        @update:claim="c => $emit('update', c)"
        @close="showModal = false;"
      />
    </dwd-modal>
  </claim-rev-block>
</template>

<script>
import ClaimEditBlock from './ClaimEditBlock.vue';
import ClaimRevBlock from './ClaimRevBlock.vue';
import DwdModal from './DwdModal.vue';

export default {
  components: {
    ClaimEditBlock,
    ClaimRevBlock,
    DwdModal,
  },
  props: {
    claim: { type: Object, required: true },
  },
  data: () => ({
    showModal: false,
  }),
};
</script>
