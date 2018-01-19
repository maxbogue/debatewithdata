<template>
<div :class="$style.input">
  <dwd-input v-model="input1"
             placeholder="12-letter claim ID"
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
  <claim-content v-if="claim"
                 :claim="claim"
                 :trail="[]"></claim-content>
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';

import ClaimContent from './ClaimContent.vue';
import DwdInput from './DwdInput.vue';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    ClaimContent,
    DwdInput,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
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
    claim: function () {
      return this.lookupClaim(this.id);
    },
    inputError: function () {
      if (this.id && !this.claim) {
        return 'Invalid claim ID';
      }
      return '';
    },
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
            this.inputClass = 'success';
          }
        }).catch(() => {});
      } else if (this.claim) {
        this.inputClass = 'success';
      }
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
