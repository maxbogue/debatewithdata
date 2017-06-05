<template>
<div>
  <div v-if="error">{{ error }}</div>
  <template v-if="!editing">
    <div class="row gutter-16">
      <div class="col-sm-12">
        <div class="claim">
          {{ claim.text }}<span class="glyphicon glyphicon-pencil edit" @click="editing = !editing" aria-hidden="true"></span>
        </div>
      </div>
      <div v-for="point in claim.points"
           class="col-sm-6 col-lg-4">
        <div class="point" :class="[point.for]">
          {{ point.text }}
        </div>
      </div>
    </div>
  </template>
  <dwd-edit-claim v-else :claim="claim" @update="updateClaim" @cancel="editing = false" />
</div>
</template>

<script>
import DwdEditClaim from './DwdEditClaim.vue';

export default {
  components: {
    DwdEditClaim,
  },
  data: () => ({
    allClaims: {},
    editing: false,
    error: '',
  }),
  computed: {
    claim: function () {
      return this.allClaims[this.$route.params.claimId] || {};
    },
  },
  methods: {
    updateClaim: function (newClaim) {
      this.$http.put('/api/claim/' + this.$route.params.claimId, newClaim).then(function (response) {
        this.allClaims[this.$route.params.claimId] = newClaim;
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
  watch: {
    '$route': function () {
      if (this.node.children.length === 0) {
        this.startAdding();
      }
    },
  },
};
</script>

<style>
.row > div {
}
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
.point {
  padding: 15px;
}
.for {
  background-color: #80DEEA;
  border: 1px solid #00ACC1;
}
.against {
  background-color: #FFE082;
  border: 1px solid #FFB300;
}
.gutter-16.row {
  margin-right: -8px;
  margin-left: -8px;
}
.gutter-16 > [class^="col-"], .gutter-16 > [class^=" col-"] {
  padding: 8px;
}
</style>
