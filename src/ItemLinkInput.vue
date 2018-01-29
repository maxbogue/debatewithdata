<template>
<div :class="$style.input">
  <dwd-input :value="id"
             @input="(val) => $emit('update:id', val)"
             placeholder="Item ID"
             class="mono"
             :class="[inputClass]"
             :focus="true"
             :error="inputError" />
  <div v-if="loading" :class="$style.loader">
    <div class="ball-pulse-sync">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  <div v-if="error" :class="$style.loader" class="error">{{ error }}</div>
  <topic-content v-if="topic" :topic="topic" />
  <claim-content v-if="claim" :claim="claim" />
  <source-content v-if="source" :source="source" />
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';
import debounce from 'lodash/debounce';

import ClaimContent from './ClaimContent.vue';
import DwdInput from './DwdInput.vue';
import SourceContent from './SourceContent.vue';
import TopicContent from './TopicContent.vue';

import { DEBOUNCE_DELAY_MS } from './constants';

const ERROR_MSG = 'Item not found.';

export default {
  components: {
    ClaimContent,
    DwdInput,
    SourceContent,
    TopicContent,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    allowTopic: Boolean,
    allowClaim: Boolean,
    allowSource: Boolean,
  },
  data: () => ({
    inputClass: '',
    loading: false,
    error: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    topic: function () {
      return this.allowTopic ? this.lookupTopic(this.id) : null;
    },
    claim: function () {
      return this.allowClaim ? this.lookupClaim(this.id) : null;
    },
    source: function () {
      return this.allowSource ? this.lookupSource(this.id) : null;
    },
    itemType: function () {
      if (this.topic) {
        return 'topic';
      } else if (this.claim) {
        return 'claim';
      } else if (this.source) {
        return 'source';
      }
      return '';
    },
    inputError: function () {
      if (this.id && !this.itemType) {
        return 'Invalid ID';
      }
      return '';
    },
  },
  methods: {
    checkItemType: function () {
      if (this.itemType) {
        this.inputClass = 'success';
      }
      this.$emit('itemType', this.itemType);
    },
    makeLoader: function (newId) {
      return {
        setLoading: (loading) => {
          if (this.id === newId) {
            this.loading = loading;
            this.error = '';
          }
        },
        setError: () => {
          if (this.id === newId) {
            this.error = ERROR_MSG;
            this.loading = false;
            this.inputClass = 'error';
          }
        },
      };
    },
  },
  mountedTriggersWatchers: true,
  watch: {
    id: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.loading = false;
      this.error = '';
      this.inputClass = '';
      const newId = this.id;

      if (this.id && !this.itemType) {
        this.inputClass = 'warning';
        this.$store.dispatch('getItem', {
          id: this.id,
          loader: this.makeLoader(this.id),
        }).then(() => {
          if (this.id === newId && !this.itemType) {
            this.error = ERROR_MSG;
            this.inputClass = 'error';
          }
        }).catch(() => {});
      } else if (this.id) {
        this.inputClass = 'success';
      }
    }, DEBOUNCE_DELAY_MS),
    itemType: function () {
      this.checkItemType();
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
