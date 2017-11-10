<template>
<div>
  <dwd-flag v-if="claim.flag" :flag="claim.flag"></dwd-flag>
  <router-link v-if="trail" :to="claimUrl(claim.id, trail)">
    {{ claim.text }}
  </router-link>
  <div v-else>{{ claim.text }}</div>
</div>
</template>

<script>
import DwdFlag from './DwdFlag.vue';

export default {
  components: {
    DwdFlag,
  },
  props: ['claim', 'trail'],
};
</script>
