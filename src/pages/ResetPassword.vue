<template>
<div class="center">
  <h2>Reset Password</h2>
  <div>Enter a new password for your account.</div>
  <form class="auth" @submit.prevent="submit">
    <input type="password"
           placeholder="password"
           v-model="password">
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
    password: '',
  }),
  computed: {
    token: function () {
      return this.$route.query.token;
    },
  },
  methods: {
    submit: async function () {
      await this.$store.dispatch('resetPassword', {
        token: this.token,
        password: this.password,
        loader: this.$refs.loader,
      });
      this.$router.push('/');
    },
  },
};
</script>
