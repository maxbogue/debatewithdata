<template>
<form class="row gutter-16" @submit.prevent="commit">
  <div class="col-sm-12">
    <div class="t1">
      <input type="textarea"
             required
             autocomplete="off"
             placeholder="description"
             v-model="text"></input>
      <input type="text"
             required
             autocomplete="off"
             placeholder="url"
             ref="url"
             v-model="url"
             :class="{invalid: !validUrl}"></input>
    </div>
  </div>
  <div class="col-sm-12">
    <button type="submit" class="btn btn-default">Submit</button>
    <button type="button" class="btn btn-default" @click="cancel">Cancel</button>
  </div>
</form>
</template>

<script>
import { isWebUri } from 'valid-url';

const ERROR_MSG_INVALID_URL = 'Please enter a URL.';

export default {
  props: ['source'],
  data: () => ({
    url: '',
    text: '',
  }),
  computed: {
    validUrl: function () {
      return isWebUri(this.url);
    },
  },
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
  watch: {
    url: function () {
      if (this.validUrl) {
        this.$refs.url.setCustomValidity('');
      } else {
        this.$refs.url.setCustomValidity(ERROR_MSG_INVALID_URL);
      }
    },
  },
  mounted: function() {
    this.reset();
  },
};
</script>

<style>
</style>
