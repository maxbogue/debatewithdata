<template>
<div>
  <dwd-loader :fill="true"></dwd-loader>
  <form class="login" @submit.prevent="submit">
    <input type="text"
           label="User name"
           autocomplete="off"
           placeholder="username"
           autofocus
           v-model="username" />
    <input type="password"
           placeholder="password"
           v-model="password" />
    <button type="submit" class="btn btn-default">
      Submit
    </button>
  </form>
</div>
</template>

<script>
import URLSearchParams from 'url-search-params';

import DwdLoader from './DwdLoader.vue';
import auth from './auth';

function getNextUrl() {
  let next = new URLSearchParams(window.location.search).get('next');
  return next || '/';
}

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    'username': '',
    'password': '',
  }),
  methods: {
    submit: function () {
      auth.login(this.username, this.password).then(() => {
        this.$router.push(getNextUrl());
      });
    },
  },
};
</script>

<style>
.login {
  width: 300px;
  margin: 0 auto;
}
.login > * {
  height: 3em;
  margin-top: 10px;
  width: 100%;
}
</style>
