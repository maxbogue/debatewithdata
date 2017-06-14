<template>
<div>
  <template v-if="!editing">
    <div class="row gutter-16">
      <div class="col-sm-12">
        <div class="t1">
          <span class="glyphicon glyphicon-pencil edit click" @click="editing = !editing" aria-hidden="true"></span>
          <div>{{ claim.text }}</div>
        </div>
      </div>
      <template v-for="pi in pointIndexes">
        <dwd-point v-for="si in sideIndexes"
                   :points="claim.points"
                   :sideIndex="si"
                   :pointIndex="pi"
                   :key="'point-' + si + '-' + pi">
        </dwd-point>
        <div class="clearfix"></div>
      </template>
    </div>
  </template>
  <template v-else>
    <dwd-edit-claim :claim="claim" @commit="updateClaim" @cancel="editing = false" />
    <div v-if="error">{{ error }}</div>
  </template>
</div>
</template>

<script>
import { range } from 'lodash';

import DwdEditClaim from './DwdEditClaim.vue';
import DwdPoint from './DwdPoint.vue';

export default {
  components: {
    DwdEditClaim,
    DwdPoint,
  },
  data: () => ({
    editing: false,
    error: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.claimId;
    },
    claim: function () {
      return this.$store.state.claims[this.id] || { points: [[], []] };
    },
    pointIndexes: function () {
      return range(this.claim.points.reduce(
          (acc, pts) => Math.max(acc, pts.length), 0));
    },
    sideIndexes: function () {
      return range(this.claim.points.length);
    },
  },
  methods: {
    updateClaim: function (newClaim) {
      this.$store.dispatch('updateClaim', {
        id: this.id,
        claim: newClaim,
      }).then(() => {
        this.editing = false;
        this.error = '';
      }).catch((error) => {
        this.error = error;
      });
    },
  },
  watch: {
    $route: function () {
      this.editing = false;
    },
  },
};
</script>

<style>
.edit {
  float: right;
  margin-left: 5px;
}
</style>
