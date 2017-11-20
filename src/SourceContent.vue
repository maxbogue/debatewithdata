<template>
<div v-if="source">
  <div>
    <router-link v-if="trail"
                 :to="sourceUrl(source.id, trail)"
                 class="link-icon glyphicon glyphicon-link"></router-link>
    <span>{{ source.text }}</span>
  </div>
  <div :class="$style.metadata">
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
<div v-else>Source not found.</div>
</template>

<script>
export default {
  props: ['source', 'trail'],
};
</script>

<style lang="sass" module>
.metadata
  color: #666
  font-size: 0.8em

  a
    color: #666

  strong
    color: #000
</style>
