<template>
<div :class="$style.input">
  <div>
    <dwd-input :value="value"
               @input="(val) => $emit('input', val)"
               @keydown.up.native.prevent="highlight(highlighted - 1)"
               @keydown.down.native.prevent="highlight(highlighted + 1)"
               @keydown.enter.native="onEnter"
               :placeholder="placeholder"
               :validate="validate"
               :error="inputError"
               :state="inputState"
               :focus="true"
               :mono="!!itemType" />
    <ul v-if="!itemType" :class="$style.results">
      <li v-for="(result, i) in results"
          :class="resultClass(result, i)"
          :key="result.data.id"
          @click="select(i)"
          @mousemove="highlight(i)"
          @mouseleave="highlighted = -1"
          >{{ result.data.title || result.data.text }}</li>
    </ul>
  </div>
  <topic-content v-if="topic" :topic="topic" />
  <claim-content v-if="claim" :claim="claim" />
  <source-content v-if="source" :source="source" />
</div>
</template>

<script>
import elasticlunr from 'elasticlunr';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';

import ClaimContent from './ClaimContent.vue';
import DwdInput from './DwdInput.vue';
import SourceContent from './SourceContent.vue';
import TopicContent from './TopicContent.vue';

import { DEBOUNCE_DELAY_MS } from './constants';
import { ItemType } from '../common/constants';

// All IDs only use lowercase letters, numbers, and dashes.
const ANY_ID_REGEX = /^[0-9a-z-]+$/;

export default {
  components: {
    ClaimContent,
    DwdInput,
    SourceContent,
    TopicContent,
  },
  props: {
    value: { type: String, required: true },
    allowTopic: { type: Boolean, default: false },
    allowClaim: { type: Boolean, default: false },
    allowSource: { type: Boolean, default: false },
    // DwdInput passthrough options.
    placeholder: { type: String, default: 'Text or ID' },
    validate: { type: Function, default: null },
  },
  data: () => ({
    loading: false,
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
        return ItemType.TOPIC;
      } else if (this.claim) {
        return ItemType.CLAIM;
      } else if (this.source) {
        return ItemType.SOURCE;
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
    inputError: function () {
      if (this.value && !this.itemType) {
        if (this.loading) {
          return 'Loading...';
        }
      }
      return '';
    },
    inputState: function () {
      if (this.value && !this.hasResults) {
        if (this.itemType) {
          return DwdInput.SUCCESS;
        } else if (this.loading) {
          return DwdInput.LOADING;
        }
      }
      return DwdInput.NORMAL;
    },
  },
  watch: {
    value: function () {
      this.highlighted = -1;
      this.loading = false;

      if (!ANY_ID_REGEX.test(this.value)) {
        // Don't bother going to the server if it can't be an ID.
        return;
      }

      this.getItem();
    },
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
      if (!this.itemType && this.hasResults && this.highlighted >= 0) {
        this.select(this.highlighted);
        e.stopPropagation();
      }
    },
    getItem: debounce(function () {
      /* eslint no-invalid-this: "off" */
      if (this.value && !this.itemType) {
        this.$store.dispatch('getItem', {
          id: this.value,
          loader: this.makeLoader(),
        }).catch(() => {});
      }
    }, DEBOUNCE_DELAY_MS),
    makeLoader: function () {
      return {
        setLoading: (loading) => {
          this.loading = loading;
        },
        setError: () => {
          this.loading = false;
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
          type: ItemType.CLAIM,
          data: claim,
        };
      }
      let source = this.lookupSource(result.ref);
      if (source) {
        return {
          type: ItemType.SOURCE,
          data: source,
        };
      }
      let topic = this.lookupTopic(result.ref);
      if (topic) {
        return {
          type: ItemType.TOPIC,
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
};
</script>

<style lang="scss" module>
@import "style/constants";

.input > :not(:first-child) {
  margin-top: 8px;
}

.loader {
  justify-content: left;

  > div {
    transform: scale(0.6);
    transform-origin: left;
  }
}

ul.results {
  margin-top: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 8px;
    border-width: 0 1px 1px 1px;
    border-style: solid;
    background-color: white;
    font-size: 14px;
    cursor: default;

    &:not(:first-child) {
      border-top: none;
    }

    &.claim {
      border-color: $blue-accent;

      &.highlighted {
        background-color: $blue-accent;
      }
    }

    &.source {
      border-color: $green-accent;

      &.highlighted {
        background-color: $green-accent;
      }
    }

    &.topic {
      border-color: $pink-accent;

      &.highlighted {
        background-color: $pink-accent;
      }
    }
  }
}
</style>
