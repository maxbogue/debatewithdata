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
import URLSearchParams from 'url-search-params';

import auth from './auth';

function getNextUrl() {
  let next = new URLSearchParams(window.location.search).get('next');
  return next || '/';
}

export default {
  data: () => ({
    'username': '',
    'password': '',
    'error': '',
  }),
  methods: {
    submit: function () {
      auth.login(this.username, this.password).then(() => {
        this.error = '';
        this.$router.push(getNextUrl());
      }).catch((error) => {
        this.error = error;
      });
    },
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
