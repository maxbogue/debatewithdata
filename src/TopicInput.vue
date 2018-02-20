<template>
<div :class="$style.input">
  <dwd-input v-model="input1"
             placeholder="sub-topic ID"
             class="mono"
             :class="[inputClass]"
             :error="inputError" />
  <div v-if="loading" :class="$style.loader">
    <div class="ball-pulse-sync">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  <div v-if="error" :class="$style.loader" class="error">{{ error }}</div>
  <div v-if="topic">{{ topic.title }}</div>
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';
import debounce from 'lodash/debounce';

import DwdInput from './DwdInput.vue';

import { DEBOUNCE_DELAY_MS } from './constants';

export default {
  components: {
    DwdInput,
  },
  props: {
    id: { type: String, required: true },
  },
  data: () => ({
    input1: '',
    inputClass: '',
    loading: false,
    error: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    topic: function () {
      return this.lookupTopic(this.id);
    },
    inputError: function () {
      if (this.id && !this.topic) {
        return 'Invalid topic ID';
      }
      return '';
    },
  },
  watch: {
    input1: function () {
      if (this.initialized) {
        this.$emit('update', this.input1);
      }
    },
    id: debounce(function (newId) {
      /* eslint no-invalid-this: "off" */
      this.loading = false;
      this.error = '';
      this.inputClass = '';

      if (newId && !this.topic) {
        this.inputClass = 'warning';
        this.$store.dispatch('getTopic', {
          id: newId,
          loader: this.makeLoader(newId),
        }).then(() => {
          if (this.id === newId) {
            this.inputClass = 'success';
          }
        }).catch(() => {});
      } else if (this.topic) {
        this.inputClass = 'success';
      }
    }, DEBOUNCE_DELAY_MS),
  },
  mounted: function () {
    this.input1 = this.id || '';
    if (this.topic) {
      this.inputClass = 'success';
    }
    this.$nextTick(() => {
      // If this is done immediately, the watch functions get called.
      this.initialized = true;
    });
  },
  methods: {
    makeLoader: function (newId) {
      return {
        setLoading: (loading) => {
          if (this.id === newId) {
            this.loading = loading;
            this.error = '';
          }
        },
        setError: (err) => {
          if (this.id === newId) {
            this.error = err;
            this.loading = false;
            this.inputClass = 'error';
          }
        },
      };
    },
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.input > :not(:first-child)
  margin-top: 8px

.loader
  align-items: center
  display: flex
  height: 30px
  justify-content: left

  > div
    transform: scale(0.6)
    transform-origin: left

  > div > div
    background-color: $loader-color
    border: none
</style>
