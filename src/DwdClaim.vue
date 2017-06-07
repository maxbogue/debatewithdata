<template>
<div>
  <div v-if="error">{{ error }}</div>
  <template v-if="!editing">
    <div class="row gutter-16">
      <div class="col-sm-12">
        <div class="claim">
          {{ claim.text }}<span class="glyphicon glyphicon-pencil edit click" @click="editing = !editing" aria-hidden="true"></span>
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
  <dwd-edit-claim v-else :claim="claim" @update="updateClaim" @cancel="editing = false" />
</div>
</template>

<script>
import DwdEditClaim from './DwdEditClaim.vue';
import DwdPoint from './DwdPoint.vue';
import { range } from './utils';

export default {
  components: {
    DwdEditClaim,
    DwdPoint,
  },
  data: () => ({
    allClaims: {},
    editing: false,
    error: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.claimId;
    },
    claim: function () {
      return this.allClaims[this.id] || { points: [[], []] };
    },
    pointIndexes: function () {
      return range(this.claim.points.reduce((acc, pts) => Math.max(acc, pts.length), 0));
    },
    sideIndexes: function () {
      return range(this.claim.points.length);
    },
  },
  methods: {
    updateClaim: function (newClaim) {
      this.$http.put('/api/claim/' + this.id, newClaim).then(function (response) {
        this.allClaims[this.id] = newClaim;
        this.editing = false;
      }, function (response) {
        this.error = response.data.message;
      });
    },
  },
  created: function () {
    this.$http.get('/api/claim').then(function (response) {
      this.allClaims = response.data;
    });
  },
};
</script>

<style>
.claim {
  background-color: #EEEEEE;
  border: 1px solid #757575;
  margin-top: 8px;
  padding: 15px;
}
.edit {
  float: right;
  margin-left: 5px;
}
.click:hover {
  color: #aaa;
  cursor: pointer;
}
.gutter-16.row {
  margin-right: -8px;
  margin-left: -8px;
}
.gutter-16 > [class^="col-"], .gutter-16 > [class^=" col-"] {
  padding: 8px;
}
</style>
