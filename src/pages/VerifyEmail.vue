<template>
<div>
  <h1 class="center">{{ text }}</h1>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import DwdLoader from '../components/DwdLoader.vue';

export default {
  components: {
    DwdLoader,
  },
  metaInfo: function () {
    return {
      title: 'Verify Email',
    };
  },
  data: () => ({
    text: 'Verifying...',
  }),
  computed: {
    token: function () {
      return this.$route.query.token;
    },
  },
  mounted: async function () {
    await this.$store.dispatch('verifyEmail', {
      token: this.token,
      loader: this.$refs.loader,
    });
    this.text = 'Success!';
    setTimeout(() => {
      this.$router.push('/guide');
    }, 1500);
  },
};
</script>
