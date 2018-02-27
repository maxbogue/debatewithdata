<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="point" :class="isFor | toSideString">
    <source-edit-content v-if="isUrl"
                         class="bubble"
                         :source="point.source"
                         @update="updateNewSource" />
    <div v-else class="bubble">
      <div v-if="isClaimLike && promoteClaim"
           class="hint">This point will be promoted to its own claim.</div>
      <label v-if="!point.type" class="hint">
        Add a point {{ isFor | toSideString }} the claim.
      </label>
      <item-link-input v-model="input"
                       allow-claim
                       allow-source
                       placeholder="Text, URL, or ID"
                       :validate="validate"
                       :link-only="false"
                       @itemType="updateIdType" />
      <dwd-flag v-if="isClaimLike && point.flag" :flag="point.flag" />
    </div>
    <div v-if="point.type" class="info">
      <div class="id mono">{{ point.id || 'new' }}</div>
      <button type="submit"
              class="dwd-btn dwd-btn-primary">Apply</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <div class="controls">
        <dwd-flag-dropdown v-if="isClaimLike" v-model="flag" />
        <span v-if="isClaimLike && !promoteClaim"
              title="Promote to claim."
              class="click fas fa-arrow-circle-up"
              @click="promoteClaim = true"></span>
        <span v-else-if="isClaimLike && promoteClaim"
              title="Don't promote to claim."
              class="click fas fa-arrow-circle-down"
              @click="promoteClaim = false"></span>
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
const CLAIM_LIKE = [PointType.SUBCLAIM, PointType.TEXT, PointType.NEW_CLAIM];

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
    isSubPoint: { type: Boolean, default: false },
  },
  data: () => ({
    oldPoint: null,
    flag: '',
    input: '',
    idType: '',
    // Whether a subclaim should be promoted to a new claim.
    promoteClaim: false,
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
    isClaimLike: function () {
      return CLAIM_LIKE.includes(this.point.type);
    },
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
    promoteClaim: function () {
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
    makePoint: function () {
      if (this.id && !this.idType && this.oldPoint.type) {
        return this.oldPoint;
      } else if (this.idType === PointType.SOURCE) {
        return { type: PointType.SOURCE, sourceId: this.input };
      } else if (this.idType === PointType.CLAIM) {
        return { type: PointType.CLAIM, claimId: this.input };
      } else if (isValidUrl(this.input)) {
        return {
          type: PointType.NEW_SOURCE,
          source: {
            url: this.input,
          },
        };
      } else if (!this.id && this.input) {
        let subClaim = {
          text: this.input,
        };
        if (this.flag) {
          subClaim.flag = this.flag;
        }
        if (this.promoteClaim) {
          subClaim.type = PointType.NEW_CLAIM;
        } else if (this.isSubPoint) {
          subClaim.type = PointType.TEXT;
        } else {
          subClaim.type = PointType.SUBCLAIM;
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
      this.emitPoint({ type: PointType.NEW_SOURCE, source });
    },
    updateIdType: function (idType) {
      this.idType = idType;
      this.update();
    },
    initialize: function () {
      this.initialized = false;
      this.oldPoint = this.point ? clone(this.point) : null;
      this.input = '';
      if (this.point) {
        switch (this.point.type) {
        case PointType.CLAIM:
          this.input = this.point.claimId;
          break;
        case PointType.SOURCE:
          this.input = this.point.sourceId;
          break;
        case PointType.SUBCLAIM:
        case PointType.TEXT:
        case PointType.NEW_CLAIM:
          this.input = this.point.text;
          this.flag = this.point.flag || '';
          break;
        case PointType.NEW_SOURCE:
          this.input = this.point.source.url;
          break;
        }
      }
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
};
</script>
