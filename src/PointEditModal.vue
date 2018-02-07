<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="point" :class="isFor | toSideString">
    <item-link-input v-if="id"
                     class="bubble"
                     :id.sync="input"
                     :allowClaim="true"
                     :allowSource="true"
                     @itemType="updateIdType" />
    <source-edit-content v-else-if="isUrl"
                         :source="point.source"
                         @update="updateNewSource" />
    <div v-else class="bubble">
      <label v-if="!point.type" class="hint">
        Add a point {{ isFor | toSideString }} the claim.
      </label>
      <dwd-input v-model="input"
                 ref="input"
                 placeholder="Text, URL, or 12-letter ID"
                 :focus="true"
                 :validate="validate" />
      <dwd-flag v-if="isSubClaim && point.flag" :flag="point.flag" />
    </div>
    <div v-if="point.type" class="info">
      <span class="id mono">{{ point.id || 'new' }}</span>
      <dwd-flag-dropdown v-if="isSubClaim" v-model="flag" />
    </div>
  </div>
</dwd-modal>
</template>

<script>
import clone from 'lodash/clone';

import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';
import SourceEditContent from './SourceEditContent.vue';
import { pointToInput } from './utils';
import { isValid, validatePoint, validateSource } from '../common/validate';

const ID_REGEX = /^[0-9a-f]{12}$/;

function isValidUrl(url) {
  return isValid(validateSource.url, url);
}

export default {
  components: {
    DwdFlag,
    DwdFlagDropdown,
    DwdInput,
    DwdModal,
    ItemLinkInput,
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
    idType: '',
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
      // Don't check the input directly here so that the first transition to
      // source editing correctly triggers an update.
      return this.point && this.point.type === 'newSource'
          && isValidUrl(this.point.source.url);
    },
    isSubClaim: function () {
      return this.point.type === 'subclaim' || this.point.type === 'text';
    },
  },
  methods: {
    close: function () {
      // If the point is empty, only emit it on close so it can be removed.
      if (!this.makePoint()) {
        this.emitPoint({});
      }
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.$emit('update', this.oldPoint);
      this.close();
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
      if (this.id && !this.idType && this.oldPoint.type) {
        return this.oldPoint;
      } else if (this.idType === 'source') {
        return { type: 'source', sourceId: this.input };
      } else if (this.idType === 'claim') {
        return { type: 'claim', claimId: this.input };
      } else if (isValidUrl(this.input)) {
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
    updateNewSource: function (source) {
      this.input = source.url;
      this.emitPoint({ type: 'newSource', source });
    },
    updateIdType: function (idType) {
      this.idType = idType;
      this.update();
    },
    initialize: function () {
      this.initialized = false;
      this.oldPoint = this.point ? clone(this.point) : null;
      this.input = pointToInput(this.point);
      this.flag = this.point.flag || '';
      this.$nextTick(() => {
        // If this is done immediately, the watch functions get called.
        this.initialized = true;
      });
    },
    validate: function (input) {
      switch (this.point.type) {
      case 'claim':
        validatePoint.claimId(input);
        break;
      case 'source':
        validatePoint.sourceId(input);
        break;
      default:
        validatePoint.text(input);
      }
    },
  },
  mounted: function () {
    this.initialize();
  },
  watch: {
    input: function () {
      this.idType = '';
      if (this.initialized && !this.isUrl) {
        this.update();
      }
    },
    flag: function () {
      this.update();
    },
    show: function () {
      if (this.show) {
        this.initialize();
      }
    },
  },
};
</script>
