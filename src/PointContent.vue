<template>
<div>
  <claim-content v-if="isClaim"
                 :claim="point" />
  <source-content v-else-if="isSource"
                  :source="point" />
</div>
</template>

<script>
import ClaimContent from './ClaimContent.vue';
import SourceContent from './SourceContent.vue';
import { PointType } from '../common/constants';

export default {
  components: {
    ClaimContent,
    SourceContent,
  },
  props: {
    point: { type: Object, required: true },
  },
  computed: {
    isClaim: function () {
      return this.point.pointType === PointType.CLAIM
          || this.point.pointType === PointType.NEW_CLAIM;
    },
    isSource: function () {
      return this.point.pointType === PointType.SOURCE
          || this.point.pointType === PointType.NEW_SOURCE;
    },
  },
};
</script>
