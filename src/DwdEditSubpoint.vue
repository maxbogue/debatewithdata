<template>
<li class="flex-row" :class="['side-' + side]">
  <textarea rows="1"
            autocomplete="off"
            placeholder="New sub-claim or 12-letter ID"
            ref="input"
            v-model="input"
            v-auto-resize
            :class="[inputClass]" />
  <span v-if="canDelete"
        class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
  <router-link v-if="claim"
               class="source-text"
               :to="claimUrl(point.id) + '/edit'">{{ claim.text }}</router-link>
  <template v-else-if="source">
    <router-link :to="sourceUrl(point.id) + '/edit'"
                 class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
  </template>
  <div v-else-if="isId">No claim or source with that ID found.</div>
</li>
</template>

<script>
import { pointToInput } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  props: ['point', 'side', 'canDelete'],
  data: () => ({
    input: '',
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
          id: this.input,
        };
      } else if (this.source) {
        return {
          type: 'source',
          id: this.input,
        };
      } else {
        return {
          type: 'text',
          text: this.input,
          tempId: this.point.tempId,
        };
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
  watch: {
    input: function () {
      this.updatePoint();
      this.setError();
    },
  },
};
</script>
