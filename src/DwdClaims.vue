<template>
<div>
  <router-link v-for="(claim, id) in claims"
               class="claim"
               :to="'/claim/' + id"
               :key="id">
    {{ claim.text }}
  </router-link>
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
a.claim {
  color: #000;
  display: block;
}
a.claim:hover {
  background-color: #E0E0E0;
  text-decoration: none;
}
</style>
