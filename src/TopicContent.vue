<template>
<div>
  <template v-if="!topic.deleted">
    <h2>{{ topic.title }}</h2>
    <div>{{ topic.text }}</div>
  </template>
  <em v-else class="error">[deleted]</em>
</div>
</template>

<script>
export default {
  props: {
    topic: { type: Object, required: true },
  },
};
</script>
