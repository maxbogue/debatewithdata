<template>
<dwd-modal :show="Boolean(errorMessage)" max-width="350px">
  <div :class="$style.block">
    <div :class="$style.error">{{ errorMessage }}</div>
    <div>
      <button type="button"
              class="dwd-btn red-dark"
              :class="$style.button"
              @click="clearError">Ok</button>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import { mapState } from 'vuex';

import DwdModal from './DwdModal.vue';

export default {
  components: {
    DwdModal,
  },
  computed: {
    ...mapState(['errorMessage']),
  },
  methods: {
    clearError: function () {
      this.$store.commit('setErrorMessage', '');
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.block {
  background-color: $background-light;
  padding: $block-padding;
  border-radius: 3px;
  text-align: center;
}

.button {
  min-width: 100px;
  margin-top: $block-padding;
}
</style>
