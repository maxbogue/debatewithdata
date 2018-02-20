<template>
<div>
  <point-rev-content v-if="noChange" :rev="curr" />
  <claim-rev-content v-else-if="bothNotLinks" :curr="curr" :prev="prev" />
  <template v-else>
    <point-rev-content v-if="prev && prev.type" :rev="prev" class="del" />
    <point-rev-content v-if="curr && curr.type" :rev="curr" class="ins" />
  </template>
</div>
</template>

<script>
import ClaimRevContent from './ClaimRevContent.vue';
import PointRevContent from './PointRevContent.vue';
import { pointsAreSame } from '../common/diff';

export default {
  components: {
    ClaimRevContent,
    PointRevContent,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
  },
  computed: {
    noChange: function () {
      return this.curr && this.prev && pointsAreSame(this.curr, this.prev);
    },
    bothNotLinks: function () {
      return this.curr && this.prev
          && this.curr.type === this.prev.type
          && (this.curr.type === 'text' || this.curr.type ==='subclaim');
    },
  },
};
</script>
