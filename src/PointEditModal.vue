<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="point" :class="isFor | toSideString">
    <source-edit-content v-if="isUrl"
                         class="bubble"
                         :source="point"
                         @update="updateNewSource" />
    <div v-else class="bubble">
      <div v-if="isNewClaim" class="hint">This will create a new claim.</div>
      <label v-if="!point.pointType" class="hint">
        Add a point {{ isFor | toSideString }} the claim.
      </label>
      <item-link-input v-model="input"
                       allow-claim
                       allow-source
                       placeholder="Text, URL, or ID"
                       :validate="validate"
                       @itemType="updateLinkType" />
      <dwd-flag v-if="isNewClaim && point.flag" :flag="point.flag" />
    </div>
    <div class="info">
      <div class="id mono">{{ point.id || 'new' }}</div>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button type="submit"
              class="dwd-btn dwd-btn-primary">Review</button>
      <div class="controls">
        <dwd-flag-dropdown v-if="isNewClaim" v-model="flag" />
      </div>
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
import { isValid, validatePoint, validateSource } from '../common/validate';
import { PointType } from '../common/constants';

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
    show: { type: Boolean, required: true },
    point: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
  },
  data: () => ({
    oldPoint: null,
    flag: '',
    input: '',
    linkType: '',
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
      return this.point && this.point.pointType === PointType.NEW_SOURCE
          && isValidUrl(this.point.url);
    },
    isNewClaim: function () {
      return this.point.pointType === PointType.NEW_CLAIM;
    },
  },
  watch: {
    input: function () {
      this.linkType = '';
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
  mounted: function () {
    this.initialize();
  },
  methods: {
    close: function () {
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.$emit('update', this.oldPoint);
      this.close();
    },
    makePoint: function () {
      if (this.id && !this.linkType && this.oldPoint.pointType) {
        return this.oldPoint;
      } else if (this.linkType === PointType.SOURCE) {
        return {
          pointType: PointType.SOURCE,
          ...this.lookupSource(this.input),
        };
      } else if (this.linkType === PointType.CLAIM) {
        return {
          pointType: PointType.CLAIM,
          ...this.lookupClaim(this.input),
        };
      } else if (isValidUrl(this.input)) {
        return {
          pointType: PointType.NEW_SOURCE,
          url: this.input,
        };
      } else if (!this.id && this.input) {
        let newClaim = {
          pointType: PointType.NEW_CLAIM,
          text: this.input,
        };
        if (this.flag) {
          newClaim.flag = this.flag;
        }
        return newClaim;
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
      this.emitPoint({ pointType: PointType.NEW_SOURCE, ...source });
    },
    updateLinkType: function (linkType) {
      this.linkType = linkType;
      this.update();
    },
    initialize: function () {
      this.initialized = false;
      this.oldPoint = this.point ? clone(this.point) : null;
      this.input = '';
      if (this.point) {
        switch (this.point.pointType) {
        case PointType.NEW_CLAIM:
          this.input = this.point.text;
          this.flag = this.point.flag || '';
          break;
        case PointType.NEW_SOURCE:
          this.input = this.point.url;
          break;
        }
      }
      this.$nextTick(() => {
        // If this is done immediately, the watch functions get called.
        this.initialized = true;
      });
    },
    validate: function (input) {
      switch (this.point.pointType) {
      case PointType.CLAIM:
        validatePoint.claimId(input);
        break;
      case PointType.SOURCE:
        validatePoint.sourceId(input);
        break;
      default:
        validatePoint.text(input);
      }
    },
  },
};
</script>
