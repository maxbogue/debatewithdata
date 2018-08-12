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
  async created() {
    await this.$store.dispatch('logout');
    this.$router.replace(this.nextUrl);
  },
};
</script>
