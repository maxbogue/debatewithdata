<template>
<div class="center">
  <h2>Forgot Password</h2>
  <div>Enter the email for your account to reset your password.</div>
  <div v-if="success" class="auth">
    A password reset email has been sent to {{ email }} if it is associated
    with an account.
  </div>
  <form v-else class="auth" @submit.prevent="submit">
    <input type="text"
           placeholder="email"
           v-model="email">
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
  data: () => ({
    success: false,
    email: '',
  }),
  methods: {
    submit: async function () {
      await this.$store.dispatch('forgotPassword', {
        email: this.email,
        loader: this.$refs.loader,
      });
      this.success = true;
    },
  },
};
</script>
