<template>
<div class="input">
  <label v-if="!point.type" class="hint">
    Add a point {{ isFor | toSideString }} the claim.
  </label>
  <textarea rows="1"
            autocomplete="off"
            placeholder="Text, URL, or 12-letter ID"
            ref="input1"
            v-model="input1"
            v-auto-resize
            :class="[inputClass]" />
  <template v-if="isUrl">
    <label class="hint">
      URL detected; describe the data this new source provides.
    </label>
    <textarea rows="1"
              autocomplete="off"
              placeholder="source description"
              ref="input2"
              v-model="input2"
              v-auto-resize />
  </template>
  <div v-if="loading" class="loader">
    <div class="ball-pulse-sync">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  <div v-if="error" class="loader error">{{ error }}</div>
  <point-content v-if="claim || source"
                 :point="point"
                 :trail="[]"></point-content>
  <dwd-flag v-else-if="point.flag" :flag="point.flag"></dwd-flag>
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';
import { isWebUri } from 'valid-url';

import DwdFlag from './DwdFlag.vue';
import PointContent from './PointContent.vue';
import { pointToInput } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdFlag,
    PointContent,
  },
  props: ['point', 'isFor'],
  data: () => ({
    input1: '',
    input2: '',
    inputClass: '',
    loading: false,
    error: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    id: function () {
      if (ID_REGEX.test(this.input1)) {
        return this.input1;
      }
      return '';
    },
    isUrl: function () {
      return isWebUri(this.input1);
    },
    claim: function () {
      return this.id ? this.$store.state.claims[this.id] : null;
    },
    source: function () {
      return this.id ? this.$store.state.sources[this.id] : null;
    },
  },
  methods: {
    update: function () {
      this.updateError();
      let type = '';
      if (this.source) {
        type = 'source';
      } else if (this.claim) {
        type = 'claim';
      } else if (this.isUrl) {
        type = 'newSource';
      } else if (!this.id && this.input1) {
        type = 'text';
      }
      this.$emit('update', type, this.input1, this.input2);
    },
    updateError: function () {
      let error1 = '';
      let error2 = '';
      if (this.id && !this.claim && !this.source) {
        error1 = 'Invalid ID';
      } else if (this.isUrl && !this.input2) {
        error2 = 'Source description required';
      }
      this.$refs.input1.setCustomValidity(error1);
      if (this.$refs.input2) {
        this.$refs.input2.setCustomValidity(error2);
      }
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
            this.inputClass = 'mono invalid';
          }
        },
      };
    },
  },
  mounted: function () {
    this.input1 = pointToInput(this.point);
    this.$nextTick(() => {
      // If this is done immediately, the watch functions get called.
      this.initialized = true;
    });
  },
  watch: {
    input1: function () {
      if (this.initialized) {
        this.update();
      }
    },
    input2: function () {
      if (this.initialized) {
        this.update();
      }
    },
    id: function (newId) {
      this.loading = false;
      this.error = '';
      this.inputClass = '';
      if (this.id && !(this.claim || this.source)) {
        this.inputClass = 'mono warning';
        this.$store.dispatch('getItem', {
          id: this.input1,
          loader: this.makeLoader(newId),
        }).then(() => {
          if (this.id === newId) {
            this.inputClass = 'mono valid';
            this.update();
          }
        }).catch(() => {});
      } else if (this.claim || this.source) {
        this.inputClass = 'mono valid';
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
