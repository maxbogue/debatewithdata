<template>
<div v-if="loading" class="loader">
  <div class="ball-pulse-sync">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
<div v-else-if="error" class="error">
  {{ error }}
</div>
<div v-else-if="fill" class="loader">
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';

export default {
  props: ['fill'],
  data: () => ({
    loading: false,
    error: '',
  }),
  methods: {
    setLoading: function (loading) {
      this.loading = loading;
      this.error = '';
    },
    setError: function (error) {
      this.error = error;
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.loader, .error {
  align-items: center;
  display: flex;
  height: 60px;
  margin-top: 25px;
  justify-content: center;
}
.loader > div > div {
  background-color: #666;
  border: none;
}
.error {
  color: red;
  font-size: 1.1em;
  text-align: center;
}
</style>
