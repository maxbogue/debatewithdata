<template>
<div :class="$style.input">
  <dwd-input :value="id"
             @input="(val) => $emit('update:id', val)"
             placeholder="Item ID"
             :error="inputError"
             :state="inputState"
             :focus="true"
             :mono="true" />
  <div v-if="loading" :class="$style.loader">
    <div class="ball-pulse-sync">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
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
    loading: false,
    inputError: '',
    inputState: DwdInput.NORMAL,
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
  },
  methods: {
    checkItemType: function () {
      if (this.itemType) {
        this.inputState = DwdInput.SUCCESS;
      }
      this.$emit('itemType', this.itemType);
    },
    makeLoader: function (newId) {
      return {
        setLoading: (loading) => {
          if (this.id === newId) {
            this.loading = loading;
            this.inputError = loading ? 'Loading...' : '';
          }
        },
        setError: () => {
          if (this.id === newId) {
            this.loading = false;
            this.inputError = ERROR_MSG;
            this.inputState = DwdInput.ERROR;
          }
        },
      };
    },
  },
  watch: {
    id: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.loading = false;
      this.inputError = '';
      this.inputState = DwdInput.NORMAL;
      const newId = this.id;

      if (this.id && !this.itemType) {
        this.inputState = DwdInput.WARNING;
        this.$store.dispatch('getItem', {
          id: this.id,
          loader: this.makeLoader(this.id),
        }).then(() => {
          if (this.id === newId && !this.itemType) {
            this.inputError = ERROR_MSG;
            this.inputState = DwdInput.ERROR;
          }
        }).catch(() => {});
      } else if (this.id) {
        this.inputState = DwdInput.SUCCESS;
      }
    }, DEBOUNCE_DELAY_MS),
    itemType: function () {
      this.checkItemType();
    },
  },
  mountedTriggersWatchers: true,
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
