<template>
<div>Logging out...</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Logout',
  },
  computed: {
    nextUrl: function () {
      return this.$route.query.next || '/';
    },
  },
  created: async function () {
    await this.$store.dispatch('logout');
    this.$router.replace(this.nextUrl);
  },
};
</script>
