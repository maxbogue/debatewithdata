<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="claim">
    <div class="bubble">
      <label for="text" class="hint">
        A claim should be a short, simple statement about the world.
      </label>
      <item-link-input v-model="text"
                       id="text"
                       allow-claim
                       placeholder="claim"
                       :validate="validate.text"
                       @itemType="updateIsLink" />
      <dwd-flag v-if="text && flag && !isLink" :flag="flag" />
    </div>
    <div class="info">
      <div v-if="!isLink" class="id mono">new</div>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="submit"
              class="dwd-btn dwd-btn-primary">Review</button>
      <div v-if="!isLink" class="controls">
        <dwd-flag-dropdown v-model="flag" />
      </div>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';
import { validateClaim } from '../common/validate';
import { ItemType } from '../common/constants';

export default {
  components: {
    DwdFlag,
    DwdFlagDropdown,
    DwdInput,
    DwdModal,
    ItemLinkInput,
  },
  props: {
    show: { type: Boolean, required: true },
  },
  data: () => ({
    text: '',
    flag: '',
    isLink: false,
    validate: validateClaim,
  }),
  computed: {
    newClaim: function () {
      if (this.isLink) {
        return null;
      }

      let claim = {
        text: this.text,
        points: [[], []],
      };

      if (this.flag) {
        claim.flag = this.flag;
      }

      return claim;
    },
  },
  watch: {
    show: function () {
      if (this.show) {
        this.text = '';
        this.flag = '';
      }
    },
  },
  methods: {
    close: function () {
      if (this.isLink) {
        this.$emit('link', this.text);
      } else {
        this.$emit('add', this.newClaim);
      }
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.$emit('update:show', false);
    },
    updateIsLink: function (itemType) {
      this.isLink = itemType === ItemType.CLAIM;
    },
  },
};
</script>
