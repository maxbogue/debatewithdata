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
    <template v-for="i in numPointRows">
      <div v-if="pointsFor[i-1]" class="col-sm-6">
        <div class="point for">
          <bs-input type="textarea"
                    autocomplete="off"
                    placeholder="argument"
                    v-model="pointsFor[i-1].text" />
          <span class="delete glyphicon glyphicon-trash"
                aria-hidden="true"
                @click="pointsFor.splice(i-1, 1)"></span>
        </div>
      </div>
      <div v-if="pointsAgainst[i-1]"
           class="col-sm-6"
           :class="{'col-sm-offset-6': !pointsFor[i-1]}">
        <div class="point against">
          <bs-input type="textarea"
                    autocomplete="off"
                    placeholder="argument"
                    v-model="pointsAgainst[i-1].text" />
          <span class="delete glyphicon glyphicon-trash"
                aria-hidden="true"
                @click="pointsAgainst.splice(i-1, 1)"></span>
        </div>
      </div>
      <div class="clearfix"></div>
    </template>
    <div class="col-sm-6">
      <button type="button" :disabled="lastPointForEmpty" class="btn btn-default" @click="addPointFor">
        Add point for
      </button>
    </div>
    <div class="col-sm-6">
      <button type="button" :disabled="lastPointAgainstEmpty" class="btn btn-default" @click="addPointAgainst">
        Add point against
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

export default {
  components: {
    'bs-input': input,
    'bs-button-group': buttonGroup,
    'bs-radio': radio,
  },
  props: ['claim'],
  data: () => ({
    text: '',
    pointsFor: [],
    pointsAgainst: [],
  }),
  computed: {
    lastPointForEmpty: function () {
      let n = this.pointsFor.length;
      return n > 0 && !this.pointsFor[n-1].text;
    },
    lastPointAgainstEmpty: function () {
      let n = this.pointsAgainst.length;
      return n > 0 && !this.pointsAgainst[n-1].text;
    },
    numPointRows: {
      cache: false,
      get: function () {
        return Math.max(this.pointsFor.length, this.pointsAgainst.length);
      },
    },
  },
  methods: {
    submit: function () {
      this.$emit('update', {
        text: this.text,
        pointsFor: this.pointsFor,
        pointsAgainst: this.pointsAgainst,
      });
    },
    cancel: function () {
      this.reset();
      this.$emit('cancel');
    },
    reset: function () {
      this.text = this.claim.text;
      this.pointsFor = clone(this.claim.pointsFor);
      this.pointsAgainst = clone(this.claim.pointsAgainst);
    },
    addPointFor: function () {
      this.pointsFor.push({
        text: '',
      });
      this.pointsAgainst.push({});
      this.pointsAgainst.pop();
    },
    addPointAgainst: function () {
      this.pointsAgainst.push({
        text: '',
      });
      this.pointsFor.push({});
      this.pointsFor.pop();
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
