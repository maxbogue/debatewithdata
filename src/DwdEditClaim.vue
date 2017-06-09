<template>
<form @submit.prevent="commit">
  <div class="row gutter-16">
    <div class="col-sm-12">
      <div class="claim">
        <bs-input type="textarea"
                  autocomplete="off"
                  placeholder="claim"
                  v-model="text"></bs-input>
      </div>
    </div>
    <template v-for="pi in pointIndexes">
      <dwd-edit-point v-for="si in sideIndexes"
                      :points="points"
                      :sideIndex="si"
                      :pointIndex="pi"
                      :key="'editPoint-' + si + '-' + pi"
                      @delete="deletePoint(si, pi)">
      </dwd-edit-point>
      <div class="clearfix"></div>
    </template>
    <div v-for="si in sideIndexes" class="col-sm-6">
      <button type="button" :disabled="lastPointEmpty(si)" class="btn btn-default" @click="addPoint(si)">
        Add point {{ sideString(si) }}
      </button>
    </div>
    <div class="col-sm-12">
      <button type="submit" class="btn btn-default">
        Submit
      </button>
      <button type="button" class="btn btn-default" @click="cancel">
        Cancel
      </button>
    </div>
  </div>
</form>
</template>

<script>
import clone from 'clone';
import { input, buttonGroup, radio } from 'vue-strap';

import DwdEditPoint from './DwdEditPoint.vue';
import { range } from './utils';

export default {
  components: {
    'bs-input': input,
    'bs-button-group': buttonGroup,
    'bs-radio': radio,
    DwdEditPoint,
  },
  props: ['claim'],
  data: () => ({
    text: '',
    points: [[], []],
  }),
  computed: {
    pointIndexes: function () {
      return range(this.points.reduce((acc, pts) => Math.max(acc, pts.length), 0));
    },
    sideIndexes: function () {
      return range(this.points.length);
    },
  },
  methods: {
    lastPointEmpty: function (i) {
      let n = this.points[i].length;
      return n > 0 && !this.points[i][n-1].text;
    },
    commit: function () {
      this.$emit('commit', {
        text: this.text,
        points: this.points,
      });
    },
    cancel: function () {
      this.reset();
      this.$emit('cancel');
    },
    reset: function () {
      if (this.claim) {
        this.text = this.claim.text;
        this.points = clone(this.claim.points);
      }
    },
    addPoint: function (i) {
      this.points[i].push({
        text: '',
      });
      this.points[1-i].push({});
      this.points[1-i].pop();
    },
    deletePoint: function (si, pi) {
      this.points[si].splice(pi, 1);
    },
    sideString: function (i) {
      return ['for', 'against'][i];
    },
  },
  mounted: function() {
    this.reset();
  },
};
</script>

<style>
.claim > .form-group, .point > .form-group {
  margin-bottom: 0;
}
.for-chooser {
  margin-bottom: 8px;
}
.for-chooser > label {
  font-size: 10px;
  padding: 4px 8px;
}
</style>
