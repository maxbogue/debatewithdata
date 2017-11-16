<template>
<div>
  <dwd-flag v-if="claim.flag" :flag="claim.flag"></dwd-flag>
  <router-link v-if="trail"
               :to="claimUrl(claim.id, trail)"
               class="link-icon glyphicon glyphicon-link"></router-link>
  <span>{{ claim.text }}</span>
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
