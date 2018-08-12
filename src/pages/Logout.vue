<template>
<div>Logging out...</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Logout',
  },
  computed: {
    nextUrl() {
      return this.$route.query.next || '/';
    },
  },
  created: async function () {
    await this.$store.dispatch('logout');
    this.$router.replace(this.nextUrl);
  },
};
</script>
