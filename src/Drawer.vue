<template>
<transition name="drawer"
            @after-enter="afterEnter"
            @after-leave="afterLeave">
  <div v-show="innerShow"
       ref="drawer"
       class="drawer"
       :style="{ maxHeight }">
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
    height: 0,
  }),
  computed: {
    maxHeight: function () {
      return Math.min(this.height, MAX_HEIGHT) + 'px';
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
      this.innerShow = true;
    },
    close: function () {
      let { drawer } = this.$refs;
      this.height = drawer.scrollHeight;
      Vue.nextTick(() => {
        this.height = 0;
        this.innerShow = false;
      });
    },
    afterEnter: function () {
      this.height = MAX_HEIGHT;
    },
    afterLeave: function () {
      this.height = 0;
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
