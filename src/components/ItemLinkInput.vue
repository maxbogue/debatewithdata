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
          :key="result.item.id"
          @click="select(i)"
          @mousemove="highlight(i)"
          @mouseleave="highlighted = -1"
          >{{ result.item.title || result.item.text }}</li>
    </ul>
  </div>
  <topic-content v-if="topic" :topic="topic" />
  <claim-content v-if="claim" :claim="claim" />
  <source-content v-if="source" :source="source" />
</div>
</template>

<script>
import debounce from 'lodash/debounce';

import ClaimContent from './ClaimContent.vue';
import DwdInput from './DwdInput.vue';
import SourceContent from './SourceContent.vue';
import TopicContent from './TopicContent.vue';
import { DEBOUNCE_DELAY_MS } from '@/constants';
import { ItemType } from '@/common/constants';

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
    results: [],
  }),
  computed: {
    topic() {
      return this.allowTopic ? this.lookupTopic(this.value) : null;
    },
    claim() {
      return this.allowClaim ? this.lookupClaim(this.value) : null;
    },
    source() {
      return this.allowSource ? this.lookupSource(this.value) : null;
    },
    itemType() {
      if (this.topic) {
        return ItemType.TOPIC;
      } else if (this.claim) {
        return ItemType.CLAIM;
      } else if (this.source) {
        return ItemType.SOURCE;
      }
      return '';
    },
    allowedTypes() {
      const types = [];
      if (this.allowTopic) {
        types.push(ItemType.TOPIC);
      }
      if (this.allowClaim) {
        types.push(ItemType.CLAIM);
      }
      if (this.allowSource) {
        types.push(ItemType.SOURCE);
      }
      return types;
    },
    hasResults() {
      return this.results.length > 0;
    },
    inputError() {
      if (this.value && !this.itemType) {
        if (this.loading) {
          return 'Loading...';
        }
      }
      return '';
    },
    inputState() {
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
    value() {
      this.highlighted = -1;
      this.loading = false;

      if (!this.value || this.itemType) {
        this.results = [];
        return;
      }

      this.queryServer();
    },
    itemType() {
      this.$emit('itemType', this.itemType);
    },
  },
  mountedTriggersWatchers: true,
  methods: {
    highlight(i) {
      if (this.hasResults) {
        this.highlighted = (i + this.results.length) % this.results.length;
      }
    },
    select(i) {
      const result = this.results[i];
      if (result) {
        this.$emit('input', result.item.id);
      }
    },
    onEnter(e) {
      if (!this.itemType && this.hasResults && this.highlighted >= 0) {
        this.select(this.highlighted);
        e.stopPropagation();
      }
    },
    queryServer: debounce(async function() {
      /* eslint no-invalid-this: "off" */
      const query = this.value;
      this.loading = true;
      const { results } = await this.$store.dispatch('search', {
        query,
        types: this.allowedTypes,
        limit: 5,
        loader: this.makeLoader(),
      });
      if (query === this.value) {
        this.results = results.map(this.lookupItemWithType);
        this.loading = false;
      }
    }, DEBOUNCE_DELAY_MS),
    makeLoader() {
      return {
        setLoading: loading => {
          this.loading = loading;
        },
        setError: () => {
          this.loading = false;
        },
      };
    },
    resultClass(result, i) {
      return [
        this.$style[result.type],
        { [this.$style.highlighted]: i === this.highlighted },
      ];
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

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
