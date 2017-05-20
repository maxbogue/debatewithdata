<template>
<form class="register" @submit.prevent="submit">
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
  <input type="text"
         class="form-control"
         placeholder="email address"
         v-model="email" />
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
    'email': '',
    'error': '',
  }),
  methods: {
    submit: function () {
      auth.register(this);
    }
  },
};
</script>

<style>
.register > * {
  height: 3em;
  width: 300px;
  margin-bottom: 5px;
}
</style>
