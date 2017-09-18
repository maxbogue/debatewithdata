<template>
<li class="t3 flex-row" :class="[side === 0 ? 'for' : 'against']">
  <div class="flex-fill">
    <textarea rows="1"
              autocomplete="off"
              placeholder="New sub-claim or 12-letter ID"
              ref="input"
              v-model="input"
              v-auto-resize
              :class="[inputClass]" />
    <router-link v-if="claim"
                 class="source-text"
                 :to="claimUrl(point.claimId) + '/edit'">
      {{ claim.text }}
    </router-link>
    <router-link v-else-if="source"
                 :to="sourceUrl(point.sourceId) + '/edit'"
                 class="source-text">{{ source.text }}</router-link>
    <div v-else-if="isId">No claim or source with that ID found.</div>
  </div>
  <div class="controls">
    <span v-if="canDelete"
          class="delete click glyphicon glyphicon-trash"
          aria-hidden="true"
          @click="$emit('delete')"></span>
  </div>
</li>
</template>

<script>
import { pointToInput } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  props: ['point', 'side', 'canDelete'],
  data: () => ({
    input: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    isId: function () {
      return ID_REGEX.test(this.input);
    },
    claim: function () {
      return this.isId ? this.$store.state.claims[this.input] : null;
    },
    source: function () {
      return this.isId ? this.$store.state.sources[this.input] : null;
    },
    inputClass: function () {
      if (this.claim || this.source) {
        return 'mono valid';
      } else if (this.isId) {
        return 'mono invalid';
      }
      return '';
    },
  },
  methods: {
    makePoint: function () {
      if (this.claim) {
        return {
          type: 'claim',
          claimId: this.input,
        };
      } else if (this.source) {
        return {
          type: 'source',
          sourceId: this.input,
        };
      } else {
        let subpoint = {
          type: 'text',
          text: this.input,
        };
        if (this.point.id) {
          subpoint.id = this.point.id;
        } else {
          subpoint.tempId = this.point.tempId;
        }
        return subpoint;
      }
    },
    updatePoint: function () {
      this.$emit('update', this.makePoint());
    },
    setError: function () {
      let error = '';
      if (this.isId && !this.claim && !this.source) {
        error = 'Invalid ID';
      }
      this.$refs.input.setCustomValidity(error);
    },
  },
  mounted: function () {
    this.input = pointToInput(this.point);
  },
  updated: function () {
    // If this is done in mounted, the watch function still gets called.
    this.initialized = true;
  },
  watch: {
    input: function () {
      if (this.initialized) {
        this.updatePoint();
        this.setError();
      }
    },
  },
};
</script>
