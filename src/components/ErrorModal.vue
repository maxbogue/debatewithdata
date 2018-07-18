<template>
<dwd-modal :show="Boolean(modalError)" max-width="350px">
  <div :class="$style.block">
    <div :class="$style.error">{{ modalError }}</div>
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
    ...mapState(['modalError']),
  },
  methods: {
    clearError: function () {
      this.$store.commit('setModalError', '');
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.block {
  padding: $block-padding;
  border-radius: 3px;
  background-color: $background-light;
  text-align: center;
}

.button {
  min-width: 100px;
  margin-top: $block-padding;
}
</style>
