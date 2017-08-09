<template>
<div>
  <h3 class="center">
    Claims are simple statements about the world.
  </h3>
  <router-link :to="addUrl" class="add click">+</router-link>
  <router-link v-for="(claim, id) in claims"
               class="t1 bubble blue"
               :to="claimUrl(id)"
               :key="id">
    {{ claim.text }}
  </router-link>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState([
      'user',
      'claims',
    ]),
    addUrl: function () {
      if (this.user) {
        return '/claims/add';
      }
      return '/login?next=/claims/add';
    },
  },
};
</script>
