<template>
<transition name="drawer">
  <div class="drawer">
    <div>
      <slot></slot>
    </div>
  </div>
</transition>
</template>

<style lang="sass">
.drawer
  max-height: 300px
  overflow: scroll

.drawer-enter-active,
.drawer-leave-active,
.drawer-enter-active > div,
.drawer-leave-active > div
  transition: all 0.3s

.drawer.drawer-enter,
.drawer.drawer-leave-to
  max-height: 0

.drawer-enter > div,
.drawer-leave-to > div
  transform: translateY(-100%)

.drawer-leave > div,
.drawer-enter-to > div
  transform: translateY(0)
</style>
