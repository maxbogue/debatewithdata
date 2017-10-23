<template>
<div class="center">
  <dwd-loader ref="loader" :fill="true"></dwd-loader>
  <div v-if="success">
    A password reset email has been sent to {{ email }} if it is associated
    with an account.
  </div>
  <form v-else class="auth" @submit.prevent="submit">
    <input type="text"
           placeholder="email"
           v-model="email" />
    <button type="submit" class="btn btn-default">
      Submit
    </button>
  </form>
</div>
</template>

<script>
import './style/auth.css';
import DwdLoader from './DwdLoader.vue';
import auth from './auth';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    success: false,
    email: '',
  }),
  methods: {
    submit: function () {
      auth.forgotPassword(this.email, this.$refs.loader)
        .then(() => {
          this.success = true;
        });
    },
  },
};
</script>
