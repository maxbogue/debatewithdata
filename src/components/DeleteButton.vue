<template>
  <div>
    <button type="button" class="dwd-btn red-dark" @click="show = true">
      {{ text }}
    </button>
    <dwd-modal :show="show" @close="close" @cancel="cancel">
      <div :class="$style.block">
        <div class="bubble">
          <dwd-input
            v-model="message"
            :validate="validate"
            focus
            placeholder="delete reason"
          />
        </div>
        <div class="info">
          <button type="submit" class="dwd-btn red-dark">Confirm</button>
          <button type="button" class="dwd-btn white" @click="cancel">
            Cancel
          </button>
        </div>
      </div>
    </dwd-modal>
  </div>
</template>

<script>
import { validateClaim } from '@/common/validate';

import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';

export default {
  components: {
    DwdInput,
    DwdModal,
  },
  props: {
    noun: { type: String, required: true },
  },
  data: () => ({
    show: false,
    message: '',
    validate: validateClaim.deleteMessage,
  }),
  computed: {
    text() {
      return 'Delete ' + this.noun;
    },
  },
  methods: {
    close() {
      this.$emit('delete', this.message);
      this.cancel();
    },
    cancel() {
      this.show = false;
      this.message = '';
    },
  },
};
</script>

<style lang="scss" module>
.block {
  background-color: #fff;
}
</style>
