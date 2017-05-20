<template>
<div>
  <dwd-header></dwd-header>
  <div class="container content">
    <router-view></router-view>
  </div>
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
