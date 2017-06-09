<template>
<form class="row gutter-16" @submit.prevent="commit">
  <div class="col-sm-12">
    <div class="source">
      <bs-input type="text"
                autocomplete="off"
                placeholder="url"
                v-model="url"></bs-input>
    </div>
  </div>
  <div class="col-sm-12">
    <div class="source">
      <bs-input type="textarea"
                autocomplete="off"
                placeholder="description"
                v-model="text"></bs-input>
    </div>
  </div>
  <div class="col-sm-12">
    <button type="submit" class="btn btn-default">
      Submit
    </button>
    <button type="button" class="btn btn-default" @click="cancel">
      Cancel
    </button>
  </div>
</form>
</template>

<script>
import { input } from 'vue-strap';

export default {
  components: {
    'bs-input': input,
  },
  props: ['source'],
  data: () => ({
    url: '',
    text: '',
  }),
  methods: {
    commit: function () {
      this.$emit('commit', {
        url: this.url,
        text: this.text,
      });
    },
    cancel: function () {
      this.reset();
      this.$emit('cancel');
    },
    reset: function () {
      if (this.source) {
        this.url = this.source.url;
        this.text = this.source.text;
      }
    },
  },
  mounted: function() {
    this.reset();
  },
};
</script>

<style>
.source > .form-group {
  margin-bottom: 0;
}
</style>
