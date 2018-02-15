<template>
  <div>
    <dwd-header />
    <router-view class="dwd-container" />
  </div>
</template>

<script>
import DwdHeader from './DwdHeader.vue';

export default {
  components: { DwdHeader },
};
</script>
