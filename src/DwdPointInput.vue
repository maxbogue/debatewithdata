<template>
<div class="input">
  <label v-if="point.tempId" class="hint">
    Add a point {{ side === 0 ? 'for' : 'against' }} the claim.
  </label>
  <textarea rows="1"
            autocomplete="off"
            placeholder="New sub-claim, URL, or 12-letter ID"
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
  <dwd-flag v-if="point.flag" :flag="flag"></dwd-flag>
  <router-link v-if="claim"
               class="source-text"
               :to="claimUrl(point.claimId) + '/edit'">
    {{ claim.text }}
  </router-link>
  <template v-else-if="source">
    <router-link :to="sourceUrl(point.sourceId) + '/edit'"
                 class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
  </template>
</div>
</template>

<script>
import 'loaders.css/loaders.min.css';
import { isWebUri } from 'valid-url';

import DwdFlag from './DwdFlag.vue';
import { pointToInput } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdFlag,
  },
  props: ['point', 'side'],
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
  },
  updated: function () {
    // If this is done in mounted, the watch functions still gets called.
    this.initialized = true;
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

<style scoped>
.input > :not(:first-child) {
  margin-top: 8px;
}
label {
  margin-bottom: -4px;
}
.side-0 > input {
  background-color: #F3E5F5;
}
.side-1 > input {
  background-color: #FFF8E1;
}
.valid {
  color: #757575;
}
.warning {
  color: #FFD600;
}
.invalid {
  color: #F44336;
}
.loader {
  align-items: center;
  display: flex;
  height: 30px;
  justify-content: left;
}
.loader > div {
  transform: scale(0.6);
  transform-origin: left;
}
.loader > div > div {
  background-color: #666;
  border: none;
}
.error {
  color: red;
  font-size: 1.1em;
}
</style>
