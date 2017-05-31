<template>
<form @submit.prevent="submit">
  <div class="row">
    <bs-input type="textarea"
              class="col-sm-12"
              autocomplete="off"
              placeholder="claim"
              v-model="text"></bs-input>
  </div>
  <div class="row">
    <div v-for="point in points" class="col-sm-6">
      <bs-button-group v-model="point.for" type="primary">
        <bs-radio selected-value="for">For</bs-radio>
        <bs-radio selected-value="against">Against</bs-radio>
      </bs-button-group>
      <bs-input type="textarea"
             autocomplete="off"
             placeholder="argument"
             v-model="point.text" />
    </div>
  </div>
  <button type="button" :disabled="lastPointEmpty" class="btn btn-default" @click="addPoint">
    Add point
  </button>

  <button type="submit" class="btn btn-default">
    Submit
  </button>
  <button type="button" class="btn btn-default" @click="cancel">
    Cancel
  </button>
</form>
</template>

<script>
import clone from 'clone';
import { input, buttonGroup, radio } from 'vue-strap';

export default {
  components: {
    'bs-input': input,
    'bs-button-group': buttonGroup,
    'bs-radio': radio,
  },
  props: ['claim'],
  data: () => ({
    text: '',
    points: [],
  }),
  computed: {
    lastPointEmpty: function () {
      let n = this.points.length;
      return n < 1 || !this.points[n-1].text;
    },
  },
  methods: {
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
      this.points = clone(this.claim.points || []);
    },
    addPoint: function () {
      this.points.push({
        for: 'for',
        text: '',
      });
    },
  },
  mounted: function() {
    this.reset();
  },
};
</script>

<style>
</style>
