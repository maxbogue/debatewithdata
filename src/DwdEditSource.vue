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
  <div v-if="error" class="col-xs-12 center">{{ error }}</div>
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
  data: () => ({
    error: '',
    initialized: false,
    text: '',
    url: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.sourceId;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    validUrl: function () {
      return isWebUri(this.url);
    },
  },
  methods: {
    commit: function () {
      let action = 'addSource';
      let payload = {
        source: {
          url: this.url,
          text: this.text,
        },
      };
      if (this.id) {
        action = 'updateSource';
        payload.id = this.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.error = '';
        this.$router.push(this.sourceUrl(id));
      }).catch((error) => {
        this.error = error;
      });
    },
    cancel: function () {
      this.$router.push(this.id ? this.sourceUrl(this.id) : '/sources');
    },
    initialize: function () {
      if (this.initialized) return;
      if (this.id && !this.source) return;

      if (this.source) {
        this.url = this.source.url;
        this.text = this.source.text;
      }
      this.initialized = true;
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
    '$store.state.loaded': function (loaded) {
      if (loaded) {
        this.initialize();
      }
    },
  },
  mounted: function() {
    this.initialize();
  },
};
</script>

<style>
</style>
