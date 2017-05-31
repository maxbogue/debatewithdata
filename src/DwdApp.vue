<template>
<div>
  <dwd-header></dwd-header>
  <router-view class="container"></router-view>
</div>
</template>

<script>
import DwdHeader from './DwdHeader.vue';

export default {
  components: { DwdHeader },
};
</script>

<style>
.content {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
