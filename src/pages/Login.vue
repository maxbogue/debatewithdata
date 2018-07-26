<template>
<div class="center">
  <h2>Login</h2>
  <form class="auth" @submit.prevent="submit">
    <input type="text"
           autocomplete="username"
           placeholder="username"
           autofocus
           v-model="username">
    <input type="password"
           autocomplete="current-password"
           placeholder="password"
           v-model="password">
    <router-link to="/forgot-password"
                 class="click-text">Forgot password?</router-link>
    <dwd-loader ref="loader" />
    <button type="submit" class="dwd-btn dwd-btn-primary">Submit</button>
  </form>
</div>
</template>

<script>
import '../style/auth.scss';
import DwdLoader from '../components/DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  metaInfo: {
    title: 'Login',
  },
  data: () => ({
    username: '',
    password: '',
  }),
  computed: {
    nextUrl: function () {
      return this.$route.query.next || '/';
    },
  },
  methods: {
    submit: async function () {
      await this.$store.dispatch('login', {
        username: this.username,
        password: this.password,
        loader: this.$refs.loader,
      });
      this.$router.push(this.nextUrl);
    },
  },
};
</script>
