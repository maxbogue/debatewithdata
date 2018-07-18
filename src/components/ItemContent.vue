<template>
<topic-content v-if="type === ItemType.TOPIC"
               :topic="item"
               :abbreviated="abbreviated"
               :is-link="isLink" />
<claim-content v-else-if="type === ItemType.CLAIM"
               :claim="item"
               :abbreviated="abbreviated"
               :is-link="isLink" />
<source-content v-else-if="type === ItemType.SOURCE"
                :source="item"
                :abbreviated="abbreviated" />
<div v-else>Invalid item type.</div>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';
import TopicContent from './TopicContent.vue';
import { ItemType } from '../../common/constants';

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
    isLink: { type: Boolean, default: false },
  },
  data: () => ({
    ItemType,
  }),
};
</script>
