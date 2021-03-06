<template>
  <form-valid class="claim" @submit="close" @keydown.native.esc="cancel">
    <div class="bubble">
      <label for="text" class="hint">
        A claim should be a short, simple statement about the world.
      </label>
      <dwd-input
        v-model="text"
        id="text"
        placeholder="claim"
        :focus="true"
        :validate="validate.text"
      />
      <dwd-flag v-if="flag" :flag="flag" />
    </div>
    <div class="info">
      <needs-data-edit v-model="needsData" />
      <button type="button" class="dwd-btn white" @click="cancel">
        Cancel
      </button>
      <button type="submit" class="dwd-btn dwd-btn-primary">Review</button>
      <div class="controls"><dwd-flag-dropdown v-model="flag" /></div>
    </div>
  </form-valid>
</template>

<script>
import clone from 'lodash/fp/clone';

import { validateClaim } from '@/common/validate';

import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import FormValid from './FormValid.vue';
import NeedsDataEdit from './NeedsDataEdit.vue';

export default {
  components: {
    NeedsDataEdit,
    DwdFlag,
    DwdFlagDropdown,
    DwdInput,
    FormValid,
  },
  props: {
    claim: { type: Object, default: null },
  },
  data: () => ({
    text: '',
    flag: '',
    needsData: null,
    oldClaim: null,
    validate: validateClaim,
  }),
  computed: {
    id() {
      if (this.oldClaim && this.oldClaim.id) {
        return this.oldClaim.id;
      }
      return null;
    },
    newClaim() {
      const claim = {
        text: this.text,
        needsData: this.needsData,
      };
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
    newClaim() {
      this.$emit('update:claim', this.newClaim);
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    close() {
      this.$emit('close');
    },
    cancel() {
      this.close();
      this.$emit('update:claim', this.oldClaim);
    },
    initialize() {
      if (this.claim) {
        this.oldClaim = clone(this.claim);
        this.text = this.claim.text;
        this.flag = this.claim.flag || '';
        this.needsData = this.claim.needsData;
      }
    },
  },
};
</script>
