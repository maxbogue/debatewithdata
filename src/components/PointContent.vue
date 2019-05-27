<template>
  <div>
    <claim-content v-if="isClaim" :claim="point" />
    <source-content v-else-if="isSource" :source="point" />
  </div>
</template>

<script>
import { PointType } from '@/common/constants';

import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';

export default {
  components: {
    ClaimContent,
    SourceContent,
  },
  props: {
    point: { type: Object, required: true },
  },
  computed: {
    isClaim() {
      return (
        this.point.pointType === PointType.CLAIM ||
        this.point.pointType === PointType.NEW_CLAIM
      );
    },
    isSource() {
      return (
        this.point.pointType === PointType.SOURCE ||
        this.point.pointType === PointType.NEW_SOURCE
      );
    },
  },
};
</script>
