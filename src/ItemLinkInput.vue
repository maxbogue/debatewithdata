<template>
<div :class="$style.input">
  <div>
    <dwd-input :value="value"
               @input="(val) => $emit('input', val)"
               @keydown.up.native.prevent="highlight(highlighted - 1)"
               @keydown.down.native.prevent="highlight(highlighted + 1)"
               @keydown.enter.native="onEnter"
               placeholder="Text or ID"
               :error="inputError"
               :state="inputState"
               :focus="true"
               :mono="true" />
    <ul v-if="!itemType" :class="$style.results">
      <li v-for="(result, i) in results"
          :class="resultClass(result, i)"
          :key="result.data.id"
          @click="select(i)"
          @mousemove="highlight(i)"
          >{{ result.data.title || result.data.text }}</li>
    </ul>
  </div>
  <div v-if="loading && !itemType" :class="$style.loader">
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
import elasticlunr from 'elasticlunr';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';

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
    value: {
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
    highlighted: 0,
    items: [],
    index: null,
  }),
  computed: {
    topic: function () {
      return this.allowTopic ? this.lookupTopic(this.value) : null;
    },
    claim: function () {
      return this.allowClaim ? this.lookupClaim(this.value) : null;
    },
    source: function () {
      return this.allowSource ? this.lookupSource(this.value) : null;
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
    results: function () {
      if (!this.index || this.itemType) {
        return [];
      }
      return this.index.search(this.value, {
        bool: 'AND',
        expand: true,
      }).slice(0, 5).map(this.resultToItem);
    },
    hasResults: function () {
      return this.results.length > 0;
    },
    inputState: function () {
      if (this.value && !this.hasResults) {
        if (this.itemType) {
          return DwdInput.SUCCESS;
        } else if (this.loading) {
          return DwdInput.WARNING;
        }
        return DwdInput.ERROR;
      }
      return DwdInput.NORMAL;
    },
  },
  methods: {
    highlight: function (i) {
      if (this.hasResults) {
        this.highlighted = (i + this.results.length) % this.results.length;
      }
    },
    select: function (i) {
      let result = this.results[i];
      if (result) {
        this.$emit('input', result.data.id);
      }
    },
    onEnter: function (e) {
      if (!this.itemType && this.hasResults) {
        this.select(this.highlighted);
        e.stopPropagation();
      }
    },
    makeLoader: function (newValue) {
      return {
        setLoading: (loading) => {
          if (this.value === newValue) {
            this.loading = loading;
            this.inputError = loading ? 'Loading...' : '';
          }
        },
        setError: () => {
          if (this.value === newValue) {
            this.loading = false;
            this.inputError = ERROR_MSG;
          }
        },
      };
    },
    updateIndex: function (items) {
      forEach(items, (item) => {
        this.index.updateDoc(item);
      });
    },
    resultToItem: function (result) {
      let claim = this.lookupClaim(result.ref);
      if (claim) {
        return {
          type: 'claim',
          data: claim,
        };
      }
      let source = this.lookupSource(result.ref);
      if (source) {
        return {
          type: 'source',
          data: source,
        };
      }
      let topic = this.lookupTopic(result.ref);
      if (topic) {
        return {
          type: 'topic',
          data: topic,
        };
      }
      console.warn('Broken item ref in index: ' + result.ref);
      return null;
    },
    resultClass: function (result, i) {
      return [
        this.$style[result.type],
        { [this.$style.highlighted]: i === this.highlighted },
      ];
    },
  },
  watch: {
    value: debounce(function () {
      /* eslint no-invalid-this: "off" */
      this.highlighted = 0;
      this.loading = false;
      this.inputError = '';
      const newValue = this.value;

      if (this.value && !this.itemType) {
        this.$store.dispatch('getItem', {
          id: this.value,
          loader: this.makeLoader(this.value),
        }).then(() => {
          if (this.value === newValue && !this.itemType) {
            this.inputError = ERROR_MSG;
          }
        }).catch(() => {});
      }
    }, DEBOUNCE_DELAY_MS),
    itemType: function () {
      this.$emit('itemType', this.itemType);
    },
  },
  mountedTriggersWatchers: true,
  mounted: function () {
    this.index = elasticlunr(function () {
      /* eslint no-invalid-this: "off" */
      this.addField('title');
      this.addField('text');
    });
    if (this.allowClaim) {
      this.$store.dispatch('getClaims', {}).then(() => {
        this.updateIndex(this.$store.state.claims);
      });
    }
    if (this.allowSource) {
      this.$store.dispatch('getSources', {}).then(() => {
        this.updateIndex(this.$store.state.sources);
      });
    }
    if (this.allowTopic) {
      this.$store.dispatch('getTopics', {}).then(() => {
        this.updateIndex(this.$store.state.topics);
      });
    }
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

ul.results
  list-style: none
  margin-top: 0
  padding: 0

  li
    background-color: white;
    border-style: solid
    border-width: 0 1px 1px 1px
    cursor: default
    font-size: 14px;
    padding: 8px;

    &:not(:first-child)
      border-top: none

    &.claim
      border-color: $blue-accent

      &.highlighted
        background-color: $blue-accent

    &.source
      border-color: $green-accent

      &.highlighted
        background-color: $green-accent

    &.topic
      border-color: $pink-accent

      &.highlighted
        background-color: $pink-accent
</style>
