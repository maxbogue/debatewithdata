<template>
<topic-content v-if="type === 'topic'"
               :topic="item"
               :abbreviated="abbreviated" />
<claim-content v-else-if="type === 'claim'"
               :claim="item"
               :abbreviated="abbreviated" />
<source-content v-else-if="type === 'source'"
                :source="item"
                :abbreviated="abbreviated" />
<div v-else>Invalid item type.</div>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';
import TopicContent from './TopicContent.vue';

export default {
  components: {
    ClaimContent,
    SourceContent,
    TopicContent,
  },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
    abbreviated: { type: Boolean, default: false },
  },
};
</script>
