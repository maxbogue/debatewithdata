<template>
<div>
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
    <input type="text"
           placeholder="email address"
           v-model="email" />
    <button type="submit" class="btn btn-default">
      Submit
    </button>
    <div v-if="error">{{ error }}</div>
  </form>
</div>
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
      auth.register(this.username, this.password, this.email).then(() => {
        this.error = '';
        this.$router.replace('/');
      }).catch((error) => {
        this.error = error;
      });
    }
  },
};
</script>
