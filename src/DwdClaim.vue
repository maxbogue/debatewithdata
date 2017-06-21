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
      <template v-if="$store.state.singleColumn">
        <div v-for="[point, side] in zippedPoints" class="col-xs-12">
          <dwd-point :point="point"
                     :side="side"
                     :key="point.claim || point.source">
          </dwd-point>
        </div>
      </template>
      <template v-else>
        <div v-for="(sidePoints, side) in claim.points" class="col-sm-6">
          <dwd-point v-for="point in sidePoints"
                     :point="point"
                     :side="side"
                     :key="point.claim || point.source">
          </dwd-point>
        </div>
      </template>
    </div>
  </template>
  <template v-else>
    <dwd-edit-claim :claim="claim" @commit="updateClaim" @cancel="editing = false" @remove="removeClaim" />
    <div v-if="error">{{ error }}</div>
  </template>
</div>
</template>

<script>
import { map } from 'lodash';

import DwdEditClaim from './DwdEditClaim.vue';
import DwdPoint from './DwdPoint.vue';
import { rotate, zipInnerWithIndex } from './utils';

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
    zippedPoints: function () {
      if (!this.claim || !this.$store.state.loaded) {
        return [];
      }
      return rotate(map(this.claim.points, zipInnerWithIndex));
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
    removeClaim: function () {
      this.$store.dispatch('removeClaim', {
        id: this.id,
      }).then(() => {
        this.$router.push('/claims');
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
