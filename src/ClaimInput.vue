<template>
<div class="input">
  <textarea rows="1"
            autocomplete="off"
            placeholder="12-letter claim ID"
            ref="input1"
            v-model="input1"
            v-auto-resize
            class="mono"
            :class="[inputClass]" />
  <div v-if="loading" class="loader">
    <div class="ball-pulse-sync">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  <div v-if="error" class="loader error">{{ error }}</div>
  <claim-content v-if="claim"
                 :claim="claim"
                 :trail="[]"></claim-content>
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';

import ClaimContent from './ClaimContent.vue';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    ClaimContent,
  },
  props: ['id'],
  data: () => ({
    input1: '',
    inputClass: '',
    loading: false,
    error: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    claim: function () {
      return this.$store.state.claims[this.id];
    },
  },
  methods: {
    updateInputError: function () {
      let error = '';
      if (this.id && !this.claim) {
        error = 'Invalid claim ID';
      }
      this.$refs.input1.setCustomValidity(error);
    },
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
            this.inputClass = 'invalid';
          }
        },
      };
    },
  },
  mounted: function () {
    this.input1 = this.id || '';
    this.$nextTick(() => {
      // If this is done immediately, the watch functions get called.
      this.initialized = true;
    });
  },
  watch: {
    input1: function () {
      if (this.initialized) {
        this.$emit('update', this.input1);
      }
    },
    id: function (newId) {
      this.loading = false;
      this.error = '';
      this.inputClass = '';
      this.updateInputError();

      if (!ID_REGEX.test(newId)) {
        return;
      }

      if (newId && !this.claim) {
        this.inputClass = 'warning';
        this.$store.dispatch('getClaim', {
          id: newId,
          loader: this.makeLoader(newId),
        }).then(() => {
          if (this.id === newId) {
            this.inputClass = 'valid';
            this.updateInputError();
          }
        }).catch(() => {});
      } else if (this.claim) {
        this.inputClass = 'valid';
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.input > :not(:first-child)
  margin-top: 8px

.valid
  color: #757575

.warning
  color: #FFD600

.invalid
  color: #F44336

.loader
  align-items: center
  display: flex
  height: 30px
  justify-content: left

  > div
    transform: scale(0.6)
    transform-origin: left

  > div > div
    background-color: #666
    border: none

.error
  color: red
  font-size: 1.1em
</style>
