<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="claim t1">
    <div class="bubble">
      <label for="text" class="hint">
        A claim should be a short, simple statement about the world.
      </label>
      <dwd-input v-model="text"
                 id="text"
                 placeholder="claim"
                 :focus="true"
                 :validate="validate.text" />
      <dwd-flag v-if="flag" :flag="flag" />
    </div>
    <div class="info">
      <div class="id mono">{{ id || 'new' }}</div>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="submit"
              class="dwd-btn dwd-btn-primary">Review</button>
      <div class="controls">
        <dwd-flag-dropdown v-model="flag" />
      </div>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import clone from 'lodash/clone';

import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import { validateClaim } from '../common/validate';

export default {
  components: {
    DwdFlag,
    DwdFlagDropdown,
    DwdInput,
    DwdModal,
  },
  props: {
    show: { type: Boolean, required: true },
    claim: { type: Object, default: null },
  },
  data: () => ({
    text: '',
    flag: '',
    oldClaim: null,
    validate: validateClaim,
  }),
  computed: {
    id: function () {
      if (this.oldClaim && this.oldClaim.id) {
        return this.oldClaim.id;
      }
      return null;
    },
    newClaim: function () {
      let claim = { text: this.text };
      if (this.flag) {
        claim.flag = this.flag;
      }
      if (this.id) {
        claim.id = this.id;
      }
      return claim;
    },
  },
  watch: {
    show: function () {
      if (this.show) {
        this.initialize();
      }
    },
    newClaim: function () {
      this.$emit('update:claim', this.newClaim);
    },
  },
  mounted: function () {
    this.initialize();
  },
  methods: {
    close: function () {
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.close();
      this.$emit('update:claim', this.oldClaim);
    },
    initialize: function () {
      if (this.claim) {
        this.oldClaim = clone(this.claim);
        this.text = this.claim.text;
        this.flag = this.claim.flag || '';
      }
    },
  },
};
</script>
