<template>
<div>
  <router-link v-for="(claim, id) in claims"
               class="t1 source-text"
               :to="claimUrl(id)"
               :key="id">
    {{ claim.text }}
  </router-link>
  <div class="center" v-if="$store.state.user">
    <router-link to="/claims/add" class="add click">+</router-link>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState([
    'claims',
  ]),
};
</script>

<style>
.add {
  font-size: 32px;
}
</style>
