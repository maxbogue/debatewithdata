<template>
<div>Logging out...</div>
</template>

<script>
import auth from '../auth';

export default {
  computed: {
    nextUrl: function () {
      return this.$route.query.next || '/';
    },
  },
  created: function () {
    auth.logout();
    this.$router.replace(this.nextUrl);
  },
};
</script>
