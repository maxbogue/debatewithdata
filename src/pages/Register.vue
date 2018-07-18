<template>
<div class="center">
  <h2>Register</h2>
  <div v-if="success" class="auth">
    Success! Please check your email to complete registration.
  </div>
  <form v-else class="auth" @submit.prevent="submit">
    <input type="text"
           autocomplete="username"
           placeholder="username"
           autofocus
           v-model="username">
    <input type="password"
           autocomplete="new-password"
           placeholder="password"
           v-model="password">
    <input type="text"
           autocomplete="email"
           placeholder="email address"
           v-model="email">
    <dwd-loader ref="loader" />
    <button type="submit" class="dwd-btn dwd-btn-primary">Submit</button>
  </form>
</div>
</template>

<script>
import '../style/auth.scss';
import DwdLoader from '../DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    success: false,
    username: '',
    password: '',
    email: '',
  }),
  methods: {
    submit: async function () {
      await this.$store.dispatch('register', {
        username: this.username,
        password: this.password,
        email: this.email,
        loader: this.$refs.loader,
      });
      this.success = true;
    }
  },
};
</script>
