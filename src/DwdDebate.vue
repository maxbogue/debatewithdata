<template>
<div>
  <div v-if="error">{{ error }}</div>
  <template v-if="!editing">
    <div class="row">
      <div class="col-sm-12">
        {{ claim.text }}
        <button class="btn btn-default" @click="editing = !editing">edit</button>
      </div>
    </div>
    <div class="row">
      <div v-for="point in claim.points"
           :class="{for: point.for === 'for', against: point.for !== 'for'}"
           class="col-sm-6">
        {{ point.text }}
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
</style>
