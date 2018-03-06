<template>
<transition name="drawer"
            :enter-active-class="$style.drawerActive"
            :leave-active-class="$style.drawerActive"
            @after-enter="afterEnter">
  <div v-show="innerShow"
       ref="drawer"
       :class="$style.drawer"
       :style="{ maxHeight }">
    <div :style="{ transform }">
      <slot></slot>
    </div>
  </div>
</transition>
</template>

<script>
const MAX_HEIGHT = 300;

export default {
  props: {
    show: { type: Boolean, required: true },
  },
  data: function () {
    return {
      innerShow: this.show,
      height: this.show ? MAX_HEIGHT : 0,
      translateY: this.show ? '0%' : '-100%',
    };
  },
  computed: {
    maxHeight: function () {
      return Math.min(this.height, MAX_HEIGHT) + 'px';
    },
    transform: function () {
      return 'translateY(' + this.translateY + ')';
    },
  },
  watch: {
    show: function (show) {
      if (show) {
        this.open();
      } else {
        this.close();
      }
    },
  },
  methods: {
    open: function () {
      let { drawer } = this.$refs;

      // Briefly override the v-show style to grab the height.
      drawer.style.display = 'block';
      let height = drawer.scrollHeight;
      drawer.style.display = '';

      this.height = height;
      this.translateY = '0%';
      this.innerShow = true;
    },
    close: function () {
      let { drawer } = this.$refs;
      this.height = drawer.scrollHeight;

      // For some reason nextTick does not work correctly here. The new start
      // height doesn't take effect in time and the animation is broken for
      // drawers shorter than the max height.
      setTimeout(() => {
        this.height = 0;
        this.translateY = '-100%';
        this.innerShow = false;
      }, 0);
    },
    afterEnter: function () {
      this.height = MAX_HEIGHT;
    },
  },
};
</script>

<style lang="scss" module>
.drawer {
  overflow: auto;
}

.drawerActive,
.drawerActive > div {
  overflow: hidden;
  transition: all 0.5s;
}
</style>
