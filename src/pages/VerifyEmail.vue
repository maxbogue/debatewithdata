<template>
<div>
  <h1 class="center">{{ text }}</h1>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import DwdLoader from '../DwdLoader.vue';
import auth from '../auth';

export default {
  components: {
    DwdLoader,
  },
  data: () => ({
    text: 'Verifying...',
  }),
  computed: {
    token: function () {
      return this.$route.query.token;
    },
  },
  mounted: function () {
    auth.verifyEmail(this.token, this.$refs.loader).then(() => {
      this.text = 'Success!';
      setTimeout(() => {
        this.$router.push('/guide');
      }, 1500);
    });
  },
};
</script>
