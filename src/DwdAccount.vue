<template>
<div class="account center">
  <div><span>user</span><span>{{ user.username }}</span></div>
  <div><span>created</span><span>{{ created }}</span></div>
  <div><span>email</span><span>{{ user.email }}</span></div>
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

<style lang="sass" scoped>
.account
  margin-top: 50px

  span
    display: inline-block
    font-size: 1.5em
    font-weight: 100
    padding: 4px
    text-align: left
    width: 60%

  span:first-child
    font-weight: 500
    text-align: right
    width: 40%
</style>
