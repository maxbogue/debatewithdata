<template>
<div>
  <template v-if="!adding">
    <router-link v-for="(claim, id) in claims"
                 class="t1 source-text"
                 :to="claimUrl(id)"
                 :key="id">
      {{ claim.text }}
    </router-link>
    <div class="center">
      <span class="add click" @click="adding = true">+</span>
    </div>
  </template>
  <template v-else>
    <dwd-edit-claim @commit="addClaim" @cancel="adding = false" />
    <div v-if="error">{{ error }}</div>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdEditClaim from './DwdEditClaim.vue';

export default {
  components: {
    DwdEditClaim,
  },
  data: () => ({
    adding: false,
    error: '',
  }),
  computed: mapState([
    'claims',
  ]),
  methods: {
    addClaim: function (claim) {
      this.$store.dispatch('addClaim', { claim }).then((id) => {
        this.adding = false;
        this.error = '';
        this.$router.push(this.claimUrl(id));
      }).catch((error) => {
        this.error = error;
      });
    },
  },
};
</script>

<style>
.add {
  font-size: 32px;
}
</style>
