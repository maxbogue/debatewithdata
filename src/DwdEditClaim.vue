<template>
<form @submit.prevent="submit">
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
      <dwd-point v-for="si in sideIndexes"
                 v-if="points[si][pi]"
                 :points="points"
                 :sideIndex="si"
                 :pointIndex="pi"
                 :key="'editPoint-' + si + '-' + pi">
        <bs-input type="textarea"
                  autocomplete="off"
                  placeholder="argument"
                  v-model="points[si][pi].text" />
        <span class="delete glyphicon glyphicon-trash"
              aria-hidden="true"
              @click="points[si].splice(pi, 1)"></span>
      </dwd-point>
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

import DwdPoint from './DwdPoint.vue';
import { range } from './utils';

export default {
  components: {
    'bs-input': input,
    'bs-button-group': buttonGroup,
    'bs-radio': radio,
    'dwd-point': DwdPoint,
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
    submit: function () {
      this.$emit('update', {
        text: this.text,
        points: this.points,
      });
    },
    cancel: function () {
      this.reset();
      this.$emit('cancel');
    },
    reset: function () {
      this.text = this.claim.text;
      this.points = clone(this.claim.points);
    },
    addPoint: function (i) {
      this.points[i].push({
        text: '',
      });
      this.points[1-i].push({});
      this.points[1-i].pop();
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
.delete {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
}
.delete:hover {
  color: #aaa;
  cursor: pointer;
}
</style>
