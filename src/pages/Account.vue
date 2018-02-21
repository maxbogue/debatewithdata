<template>
<div :class="$style.account" class="center">
  <div><strong>user</strong><span>{{ user.username }}</span></div>
  <div><strong>created</strong><span>{{ created }}</span></div>
  <div><strong>email</strong><span>{{ user.email }}</span></div>
</div>
</template>

<script>
import dateFormat from 'dateformat';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['user']),
    created: function () {
      return dateFormat(this.user.created, 'yyyy-mm-dd');
    },
  },
};
</script>

<style lang="sass" module>
@import "../style/constants"

.account
  margin-top: 50px

  span, strong
    display: inline-block
    font-size: 1.5em
    padding: 4px

  span
    font-weight: $font-weight-light
    text-align: left
    width: 60%

  strong
    text-align: right
    width: 40%
</style>
