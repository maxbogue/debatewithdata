<template>
<div>
  <dwd-loader ref="loader" :fill="true"></dwd-loader>
  <h3 v-if="success" class="center">
    Success! Please check your email to complete registration.
  </h3>
  <form v-else class="auth" @submit.prevent="submit">
    <input type="text"
           class="mono"
           label="Invite code"
           autocomplete="off"
           placeholder="invite code"
           v-model="invite"
           :disabled="$route.query.invite" />
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
import './style/auth.css';
import DwdLoader from './DwdLoader.vue';
import auth from './auth';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    success: false,
    invite: '',
    username: '',
    password: '',
    email: '',
  }),
  methods: {
    submit: function () {
      auth.register(this.invite, this.username, this.password, this.email,
          this.$refs.loader).then(() => {
        this.success = true;
      });
    }
  },
  mounted: function () {
    if (this.$route.query.invite) {
      this.invite = this.$route.query.invite;
    }
  },
};
</script>
