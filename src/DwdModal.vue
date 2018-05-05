<template>
<transition v-if="show" name="dwd-modal">
  <div class="dwd-modal-mask"
       @click="submit"
       @keydown.esc="cancel">
    <form-valid ref="form"
                class="dwd-modal-container"
                :style="maxWidth ? { maxWidth } : {}"
                @submit="close"
                @click.native.stop>
      <slot></slot>
    </form-valid>
  </div>
</transition>
</template>

<script>
import FormValid from './FormValid.vue';

export default {
  components: {
    FormValid,
  },
  props: {
    show: { type: Boolean, required: true },
    maxWidth: { type: String, default: null },
  },
  methods: {
    submit: function () {
      this.$refs.form.submit();
    },
    close: function () {
      this.$emit('close');
    },
    cancel: function () {
      this.$emit('cancel');
    },
  },
};
</script>

<style lang="scss">
@import "style/constants";

.dwd-modal-mask {
  display: flex;
  position: fixed;
  z-index: 9001;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
  background-color: rgba(0, 0, 0, 0.5);
}

.dwd-modal-container {
  width: 80%;
  max-height: calc(100% - #{$block-spacing * 2});
  overflow-y: auto;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);

  @media (min-width: $screen-sm-min) {
    width: $container-sm * 0.8;
  }

  @media (min-width: $screen-md-min) {
    width: $container-md * 0.8;
  }

  @media (min-width: $screen-lg-min) {
    width: $container-lg * 0.8;
  }

  > * {
    margin: 0;
  }
}

/* Transition styles. */

.dwd-modal-enter,
.dwd-modal-leave-active {
  opacity: 0;
}

.dwd-modal-enter .dwd-modal-container,
.dwd-modal-leave-active .dwd-modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
