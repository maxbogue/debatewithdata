<template>
<div class="center">
  <h2>Login</h2>
  <form class="auth" @submit.prevent="submit">
    <input type="text"
           label="User name"
           autocomplete="off"
           placeholder="username"
           autofocus
           v-model="username" />
    <input type="password"
           placeholder="password"
           v-model="password" />
    <router-link to="/forgot-password">Forgot password?</router-link>
    <dwd-loader ref="loader"></dwd-loader>
    <button type="submit" class="dwd-btn dwd-btn-primary">
      Submit
    </button>
  </form>
</div>
</template>

<script>
import '../style/auth.sass';
import DwdLoader from '../DwdLoader.vue';
import auth from '../auth';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    username: '',
    password: '',
  }),
  computed: {
    nextUrl: function () {
      return this.$route.query.next || '/status';
    },
  },
  methods: {
    submit: function () {
      auth.login(this.username, this.password, this.$refs.loader).then(() => {
        this.$router.push(this.nextUrl);
      });
    },
  },
};
</script>
