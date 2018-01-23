<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="point" :class="isFor | toSideString">
    <source-edit-content v-if="isUrl"
                         :source="point.source"
                         @update="updateNewSource" />
    <div v-else class="bubble" :class="$style.input">
      <label v-if="!point.type" class="hint">
        Add a point {{ isFor | toSideString }} the claim.
      </label>
      <dwd-input v-model="input"
                 ref="input"
                 placeholder="Text, URL, or 12-letter ID"
                 autofocus
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
      <point-content v-if="claim || source"
                    :point="point"
                    :trail="[]"></point-content>
      <dwd-flag v-else-if="point.flag" :flag="point.flag"></dwd-flag>
    </div>
    <div v-if="point.type" class="info">
      <span class="id mono">{{ point.id || 'new' }}</span>
      <dwd-flag-dropdown v-if="isSubClaim"
                        :flag="flag"
                        @select="updateFlag"></dwd-flag-dropdown>
    </div>
  </div>
</dwd-modal>
</template>

<script>
import 'loaders.css/loaders.min.css';
import clone from 'lodash/clone';
import { isWebUri } from 'valid-url';

import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import PointContent from './PointContent.vue';
import SourceEditContent from './SourceEditContent.vue';
import { pointToInput } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdFlag,
    DwdFlagDropdown,
    DwdInput,
    DwdModal,
    PointContent,
    SourceEditContent,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    point: {
      type: Object,
      required: true,
    },
    isFor: {
      type: Boolean,
      required: true,
    },
    isSubPoint: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    oldPoint: null,
    flag: '',
    input: '',
    inputClass: '',
    loading: false,
    error: '',
    // Flag to prevent overwriting original without a change.
    initialized: false,
  }),
  computed: {
    id: function () {
      if (ID_REGEX.test(this.input)) {
        return this.input;
      }
      return '';
    },
    isUrl: function () {
      if (this.point && this.point.type === 'newSource') {
        return isWebUri(this.point.source.url);
      }
      return isWebUri(this.input);
    },
    isSubClaim: function () {
      return this.point.type === 'subclaim' || this.point.type === 'text';
    },
    claim: function () {
      return this.id ? this.$store.state.claims[this.id] : null;
    },
    source: function () {
      return this.id ? this.$store.state.sources[this.id] : null;
    },
    inputError: function () {
      if (this.id && !this.claim && !this.source) {
        return 'Invalid ID';
      }
      return '';
    },
  },
  methods: {
    close: function () {
      this.emitPoint(this.makePoint() || {});
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.close();
      this.$emit('update', this.oldPoint);
    },
    makeSubClaim: function (text) {
      let subClaim = {
        type: this.isSubPoint ? 'text' : 'subclaim',
        text: text,
      };
      if (this.flag) {
        subClaim.flag = this.flag;
      }
      return subClaim;
    },
    makePoint: function () {
      if (this.source) {
        return { type: 'source', sourceId: this.input };
      } else if (this.claim) {
        return { type: 'claim', claimId: this.input };
      } else if (this.isUrl) {
        return {
          type: 'newSource',
          source: {
            url: this.input,
          },
        };
      } else if (!this.id && this.input) {
        let subClaim = {
          type: this.isSubPoint ? 'text' : 'subclaim',
          text: this.input,
        };
        if (this.flag) {
          subClaim.flag = this.flag;
        }
        return subClaim;
      }
      return null;
    },
    emitPoint: function (p) {
      if (this.initialized && p) {
        this.$emit('update', p);
      }
    },
    update: function () {
      this.emitPoint(this.makePoint());
    },
    updateFlag: function (flag) {
      this.flag = flag;
      this.update();
    },
    updateNewSource: function (source) {
      this.emitPoint({ type: 'newSource', source });
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
            this.inputClass = 'mono error';
          }
        },
      };
    },
  },
  mounted: function () {
    this.input = pointToInput(this.point);
    this.flag = this.point.flag || '';
    this.$nextTick(() => {
      // If this is done immediately, the watch functions get called.
      this.initialized = true;
    });
  },
  watch: {
    input: function () {
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
          id: this.input,
          loader: this.makeLoader(newId),
        }).then(() => {
          if (this.id === newId) {
            this.inputClass = 'mono success';
            this.update();
          }
        }).catch(() => {});
      } else if (this.claim || this.source) {
        this.inputClass = 'mono success';
        this.update();
      }
    },
    show: function () {
      if (this.show && this.point) {
        this.oldPoint = clone(this.point);
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
