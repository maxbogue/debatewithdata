<template>
<div>
  <dwd-loader ref="loader"></dwd-loader>
  <form class="auth" @submit.prevent="submit">
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
import './style/auth.css';
import DwdLoader from './DwdLoader.vue';
import auth from './auth';

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
    submit: function () {
      auth.resetPassword(this.token, this.password, this.$refs.loader)
        .then(() => {
          this.$router.push('/');
        });
    },
  },
};
</script>
