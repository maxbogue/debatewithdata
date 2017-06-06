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
      <template v-for="i in numPointRows">
        <div v-if="claim.pointsFor[i-1]" class="col-sm-6">
          <div class="point for">
            {{ claim.pointsFor[i-1].text }}
          </div>
        </div>
        <div v-if="claim.pointsAgainst[i-1]"
             class="col-sm-6"
             :class="{'col-sm-offset-6': !claim.pointsFor[i-1]}">
          <div class="point against">
            {{ claim.pointsAgainst[i-1].text }}
          </div>
        </div>
        <div class="clearfix"></div>
      </template>
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
    id: function () {
      return this.$route.params.claimId;
    },
    claim: function () {
      return this.allClaims[this.id] || {pointsFor: [], pointsAgainst: []};
    },
    numPointRows: function () {
      return Math.max(this.claim.pointsFor.length, this.claim.pointsAgainst.length);
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
.edit:hover {
  color: #aaa;
  cursor: pointer;
}
.point {
  padding: 15px;
  position: relative;
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
