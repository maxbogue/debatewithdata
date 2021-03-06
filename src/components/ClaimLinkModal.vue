<template>
  <dwd-modal :show="show" @close="close" @cancel="cancel">
    <div class="claim">
      <div class="bubble">
        <label for="text" class="hint">
          A claim should be a short, simple statement about the world.
        </label>
        <item-link-input
          v-model="text"
          id="text"
          allow-claim
          placeholder="claim"
          :validate="validate.text"
          @itemType="updateIsLink"
        />
        <dwd-flag v-if="text && flag && !isLink" :flag="flag" />
      </div>
      <div class="info">
        <needs-data-edit v-if="!isLink" v-model="needsData" />
        <button type="button" class="dwd-btn white" @click="cancel">
          Cancel
        </button>
        <button type="submit" class="dwd-btn dwd-btn-primary">Review</button>
        <div v-if="!isLink" class="controls">
          <dwd-flag-dropdown v-model="flag" />
        </div>
      </div>
    </div>
  </dwd-modal>
</template>

<script>
import { ItemType } from '@/common/constants';
import { validateClaim } from '@/common/validate';

import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';
import NeedsDataEdit from './NeedsDataEdit.vue';

export default {
  components: {
    DwdFlag,
    DwdFlagDropdown,
    DwdModal,
    ItemLinkInput,
    NeedsDataEdit,
  },
  props: {
    show: { type: Boolean, required: true },
  },
  data: () => ({
    text: '',
    flag: '',
    needsData: null,
    isLink: false,
    validate: validateClaim,
  }),
  computed: {
    newClaim() {
      if (this.isLink) {
        return null;
      }

      const claim = {
        text: this.text,
        needsData: this.needsData,
      };

      if (this.flag) {
        claim.flag = this.flag;
      }

      return claim;
    },
  },
  watch: {
    show() {
      if (this.show) {
        this.text = '';
        this.flag = '';
        this.needsData = null;
      }
    },
  },
  methods: {
    close() {
      if (this.isLink) {
        this.$emit('link', this.text);
      } else {
        this.$emit('add', this.newClaim);
      }
      this.$emit('update:show', false);
    },
    cancel() {
      this.$emit('update:show', false);
    },
    updateIsLink(itemType) {
      this.isLink = itemType === ItemType.CLAIM;
    },
  },
};
</script>
