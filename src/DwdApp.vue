<template>
<div>
  <dwd-header></dwd-header>
  <router-view class="dwd-container"></router-view>
</div>
</template>

<script>
import DwdHeader from './DwdHeader.vue';

export default {
  components: { DwdHeader },
};
</script>
