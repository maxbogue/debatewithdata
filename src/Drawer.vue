<template>
<transition name="drawer"
            @after-enter="afterEnter"
            @after-leave="afterLeave">
  <div v-show="innerShow" class="drawer" ref="drawer">
    <div>
      <slot></slot>
    </div>
  </div>
</transition>
</template>

<script>
import Vue from 'vue';

const MAX_HEIGHT = 300;

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    innerShow: false,
  }),
  methods: {
    open: function () {
      let { drawer } = this.$refs;

      // Briefly override the v-show style to grab the height.
      drawer.style.display = 'block';
      let height = Math.min(drawer.scrollHeight, MAX_HEIGHT);
      drawer.style.display = '';

      // Set the starting point for the transition.
      drawer.style.maxHeight = '0px';

      // Begin the animation on the next tick so it can do interpolation.
      Vue.nextTick(() => {
        drawer.style.maxHeight = height + 'px';
        // Allow Vue to take over now that the target height is set.
        this.innerShow = true;
      });
    },
    close: function () {
      let { drawer } = this.$refs;
      let height = Math.min(drawer.scrollHeight, MAX_HEIGHT);
      drawer.style.maxHeight = height + 'px';

      Vue.nextTick(() => {
        drawer.style.maxHeight = '0px';
        this.innerShow = false;
      });
    },
    afterEnter: function () {
      let { drawer } = this.$refs;
      // The actual non-transitional maxHeight of the drawer.
      drawer.style.maxHeight = MAX_HEIGHT + 'px';
    },
    afterLeave: function () {
      let { drawer } = this.$refs;
      drawer.style.maxHeight = '';
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
};
</script>

<style lang="sass">
.drawer
  overflow: auto

.drawer-enter-active,
.drawer-leave-active,
.drawer-enter-active > div,
.drawer-leave-active > div
  transition: all 0.5s

.drawer-enter > div,
.drawer-leave-to > div
  transform: translateY(-100%)

.drawer-leave > div,
.drawer-enter-to > div
  transform: translateY(0)
</style>
