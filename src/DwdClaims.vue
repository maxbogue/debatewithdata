<template>
<div>
  <template v-if="!adding">
    <router-link v-for="(claim, id) in claims"
                 class="claim"
                 :to="'/claim/' + id"
                 :key="id">
      {{ claim.text }}
    </router-link>
    <div class="center">
      <span class="add click" @click="adding = true">+</span>
    </div>
  </template>
  <dwd-edit-claim v-else @commit="addClaim" @cancel="adding = false" />
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
  }),
  computed: mapState([
    'claims',
  ]),
  methods: {
    addClaim: function (claim) {
      this.$store.dispatch('addClaim', { claim }).then(() => {
        this.adding = false;
      }).catch((error) => {
        this.error = error;
      });
    },
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
.add {
  font-size: 32px;
}
</style>
