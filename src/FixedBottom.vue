<template>
<div :class="$style.fixedBottom">
  <slot></slot>
</div>
</template>

<style lang="sass" module>
.fixedBottom
  bottom: 0
  display: flex
  justify-content: center
  left: 50%
  margin-left: -150px
  padding: 8px
  position: fixed
  width: 300px
  z-index: 1
</style>
