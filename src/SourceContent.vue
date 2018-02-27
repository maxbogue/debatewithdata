<template>
<div>
  <div>
    <router-link v-if="trail && source && source.id"
                 :to="sourceUrl(source.id, trail)"
                 class="link-icon fas fa-link" />
    <span v-if="sourceHasContent">{{ source.text }}</span>
    <em v-else class="error">[{{ source ? 'deleted' : 'not found' }}]</em>
  </div>
  <div v-if="sourceHasContent" :class="$style.metadata">
    <div v-if="source.date">{{ source.date }}</div>
    <template v-if="source.type === 'article'">
      <div><strong>Article in:</strong> {{ source.publication }}</div>
    </template>
    <template v-else-if="source.type === 'authority'">
      <div><strong>Authority:</strong> {{ source.institution }}</div>
    </template>
    <template v-else-if="source.type === 'research'">
      <div><strong>Research by:</strong> {{ source.institution }}</div>
      <div><strong>Published in:</strong> {{ source.publication }}</div>
    </template>
    <a :href="source.url" target="_blank">{{ source.url }}</a>
  </div>
</div>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true },
    trail: { type: Array, default: null },
  },
  computed: {
    sourceHasContent: function () {
      return this.source && !this.source.deleted;
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.metadata
  color: $text-dark-accent
  font-size: 0.8em

  a
    color: $text-dark-accent

  strong
    color: $text-dark
</style>
