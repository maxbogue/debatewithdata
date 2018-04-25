<template>
<div v-if="typeof claim.needsData === 'boolean'" class="data-analysis">
  <strong v-if="claim.needsData" class="error">Needs Data</strong>
  <span v-else class="success">Self-Evident</span>
</div>
<div v-else class="id mono">{{ claim.id }}</div>
</template>

<script>
export default {
  props: {
    claim: { type: Object, required: true },
  },
};
</script>
