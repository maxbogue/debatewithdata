<template>
<div :class="$style.account" class="center">
  <div>
    <strong>user</strong>
    <span>{{ user.username }}</span>
  </div>
  <div>
    <strong>created</strong>
    <span>{{ user.createdAt | shortTimestamp }}</span>
  </div>
  <div>
    <strong>email</strong>
    <span>{{ user.email }}</span>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['user']),
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.account {
  margin-top: 50px;

  div {
    display: flex;
  }

  span,
  strong {
    display: inline-block;
    padding: 4px;
    font-size: 1.5em;
  }

  span {
    width: 60%;
    font-weight: $font-weight-light;
    text-align: left;
  }

  strong {
    width: 40%;
    text-align: right;
  }
}
</style>
