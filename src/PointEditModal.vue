<template>
<dwd-modal :show="show" @close="close" @cancel="cancel">
  <div class="point" :class="isFor | toSideString">
    <source-edit-content v-if="isNewSource"
                         class="bubble"
                         :source="source"
                         :force.sync="forceSource"
                         @update:source="updateNewSource" />
    <div v-else class="bubble">
      <div v-if="isNewClaim" class="hint">
        This will create a new claim.
        <span class="click-text"
              @click="forceSource = true">Convert to data.</span>
      </div>
      <label v-else-if="!pointType" class="hint">
        Add a point {{ isFor | toSideString }} the claim.
      </label>
      <item-link-input v-model="input"
                       allow-claim
                       allow-source
                       placeholder="Text, URL, or ID"
                       :validate="validate"
                       @itemType="updateLinkType" />
      <dwd-flag v-if="isNewClaim && flag" :flag="flag" />
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
import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdInput from './DwdInput.vue';
import DwdModal from './DwdModal.vue';
import ItemLinkInput from './ItemLinkInput.vue';
import SourceEditContent from './SourceEditContent.vue';
import { isValid, validateClaim, validateSource } from '../common/validate';
import { PointType } from '../common/constants';

const ID_REGEX = /^[0-9a-f]{12}$/;

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
    forceSource: false,
    flag: '',
    input: '',
    linkType: '',
    source: {},
  }),
  computed: {
    id: function () {
      if (ID_REGEX.test(this.input)) {
        return this.input;
      }
      return '';
    },
    isUrl: function () {
      return isValid(validateSource.url, this.input);
    },
    pointType: function () {
      if (this.linkType) {
        return this.linkType;
      } else if (this.isUrl || this.forceSource) {
        return PointType.NEW_SOURCE;
      } else if (this.input) {
        return PointType.NEW_CLAIM;
      }
      return null;
    },
    isNewClaim: function () {
      return this.pointType === PointType.NEW_CLAIM;
    },
    isNewSource: function () {
      return this.pointType === PointType.NEW_SOURCE;
    },
  },
  watch: {
    forceSource: function () {
      if (this.forceSource) {
        this.source.text = this.input;
      } else {
        this.input = this.source.text;
      }
    },
    input: function () {
      this.linkType = '';
    },
    isUrl: function () {
      if (this.isUrl) {
        this.source.url = this.input;
      }
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
      let p = this.makePoint();
      this.$emit('update', p || {});
      this.$emit('update:show', false);
    },
    cancel: function () {
      this.$emit('update:show', false);
    },
    makePoint: function () {
      let pointType = this.pointType;
      switch (pointType) {
      case PointType.SOURCE:
        return { pointType, ...this.lookupSource(this.input) };
      case PointType.CLAIM:
        return { pointType, ...this.lookupClaim(this.input) };
      case PointType.NEW_SOURCE:
        return { pointType, ...this.source };
      case PointType.NEW_CLAIM:
        return { pointType, text: this.input, flag: this.flag };
      }
      return null;
    },
    updateNewSource: function (source) {
      this.source = source;
      this.input = source.url;
    },
    updateLinkType: function (linkType) {
      this.linkType = linkType;
    },
    initialize: function () {
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
    },
    validate: function (input) {
      // If the input is empty the point gets removed.
      if (!input) {
        return;
      }
      switch (this.pointType) {
      case PointType.NEW_SOURCE:
        validateSource.url(input);
        break;
      case PointType.NEW_CLAIM:
        validateClaim.text(input);
        break;
      }
    },
  },
};
</script>
