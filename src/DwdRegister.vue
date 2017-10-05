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
    <input type="text"
           placeholder="email address"
           v-model="email" />
    <button type="submit" class="btn btn-default">
      Submit
    </button>
  </form>
</div>
</template>

<script>
import DwdLoader from './DwdLoader.vue';
import auth from './auth';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    'username': '',
    'password': '',
    'email': '',
  }),
  methods: {
    submit: function () {
      auth.register(this.username, this.password, this.email).then(() => {
        this.$router.replace('/');
      });
    }
  },
};
</script>
