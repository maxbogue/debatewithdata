<template>
<div class="center">
  <h2>Register</h2>
  <div v-if="success" class="auth">
    Success! Please check your email to complete registration.
  </div>
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
    success: false,
    invite: '',
    username: '',
    password: '',
    email: '',
  }),
  mounted: function () {
    if (this.$route.query.invite) {
      this.invite = this.$route.query.invite;
    }
  },
  methods: {
    submit: function () {
      auth.register(this.invite, this.username, this.password, this.email,
          this.$refs.loader).then(() => {
        this.success = true;
      });
    }
  },
};
</script>
