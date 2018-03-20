<template>
<item-block :item="item"
            :type="point.type"
            :trail="trail"
            :is-for="isFor"
            is-link />
</template>

<script>
import ItemBlock from './ItemBlock.vue';
import { PointType } from '../common/constants';

export default {
  name: 'PointBlock',
  components: {
    ItemBlock,
  },
  props: {
    point: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
    trail: { type: Array, default: null },
  },
  computed: {
    item: function () {
      if (this.point.type === PointType.CLAIM) {
        return this.lookupClaim(this.point.claimId);
      }
      return this.lookupSource(this.point.sourceId);
    },
  },
};
</script>
