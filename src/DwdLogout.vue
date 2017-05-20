<template>
<div>Logging out...</div>
</template>

<script>
import auth from './auth';

export default {
  created: function () {
    auth.logout();
  },
};
</script>
