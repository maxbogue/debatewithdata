<template>
<div class="container" v-cloak>
  <dwd-header></dwd-header>
  <router-view></router-view>
</div>
</template>

<script>
import DwdHeader from './DwdHeader.vue';

export default {
  components: { DwdHeader },
  data: () => ({
  }),
  computed: {
  },
  methods: {
  },
};
</script>

<style>
.container {
  background: #fff;
  border: 1px solid #ddd;
  color: #222;
  padding: 0;
}
[v-cloak] {
  display: none;
}
</style>
