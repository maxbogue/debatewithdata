<template>
<form class="login" @submit.prevent="submit">
  <input type="text"
         label="User name"
         class="form-control"
         autocomplete="off"
         placeholder="username"
         v-model="username" />
  <input type="password"
         class="form-control"
         placeholder="password"
         v-model="password" />
  <button type="submit" class="btn btn-default">
    Submit
  </button>
  <div v-if="error">{{ error }}</div>
</form>
</template>

<script>
import auth from './auth';

export default {
  data: () => ({
    'username': '',
    'password': '',
    'error': '',
  }),
  methods: {
    submit: function () {
      auth.login(this);
    }
  },
};
</script>

<style>
.login > * {
  height: 3em;
  width: 300px;
  margin-bottom: 5px;
}
</style>
