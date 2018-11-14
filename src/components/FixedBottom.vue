<template>
  <div :class="$style.fixedBottom"><slot></slot></div>
</template>

<style lang="scss" module>
.fixedBottom {
  display: flex;
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 50%;
  justify-content: center;
  width: 300px;
  margin-left: -150px;
  padding: 8px;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.25);
}
</style>
