<template>
<div>
  <router-link v-for="(claim, id) in claims"
               class="claim"
               :to="'/' + id"
               :key="id">
    {{ claim.text }}
  </router-link>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
  }),
  computed: mapState(['claims']),
  methods: {
  },
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
