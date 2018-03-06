<template>
<transition v-if="show" name="dwd-modal">
  <div class="dwd-modal-mask"
       @click="close"
       @keydown.enter="close"
       @keydown.esc="cancel">
    <form ref="form"
          class="dwd-modal-container"
          @submit.prevent.stop="close"
          @click.stop>
      <slot></slot>
    </form>
  </div>
</transition>
</template>

<script>
export default {
  props: {
    show: { type: Boolean, required: true },
  },
  methods: {
    close: function () {
      if (this.$refs.form.checkValidity()) {
        this.$emit('close');
      } else {
        this.$refs.form.reportValidity();
      }
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
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  transition: opacity 0.3s ease;
  width: 100%;
  z-index: 9001;
}

.dwd-modal-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  max-height: calc(100% - #{$block-spacing * 2});
  overflow-y: auto;
  transition: all 0.3s ease;
  width: 80%;

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

// Transition styles.

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
