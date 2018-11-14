<template>
  <dwd-modal :show="show" @close="close" @cancel="cancel">
    <div class="point" :class="isFor | toSideString">
      <source-edit-content
        v-if="isNewSource"
        class="bubble"
        :source="source"
        :force.sync="forceSource"
        @update:source="updateNewSource"
      />
      <div v-else class="bubble">
        <div v-if="isNewClaim" class="hint">
          This will create a new claim.
          <span class="click-text" @click="forceSource = true;"
            >Convert to data.</span
          >
        </div>
        <label v-else-if="!pointType" class="hint">
          Add a point {{ isFor | toSideString }} the claim.
        </label>
        <item-link-input
          v-model="input"
          allow-claim
          allow-source
          placeholder="Text, URL, or ID"
          :validate="validate"
          @itemType="updateLinkType"
        />
        <dwd-flag v-if="isNewClaim && flag" :flag="flag" />
      </div>
      <div class="info">
        <div class="id mono">{{ point.id || 'new' }}</div>
        <button type="button" class="dwd-btn white" @click="cancel">
          Cancel
        </button>
        <button type="submit" class="dwd-btn dwd-btn-primary">Review</button>
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
import { PointType } from '@/common/constants';
import { isValid, validateClaim, validateSource } from '@/common/validate';

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
    flag: null,
    input: '',
    linkType: '',
    source: {},
  }),
  computed: {
    id() {
      if (ID_REGEX.test(this.input)) {
        return this.input;
      }
      return '';
    },
    isUrl() {
      return isValid(validateSource.url, this.input);
    },
    pointType() {
      if (this.linkType) {
        return this.linkType;
      } else if (this.isUrl || this.forceSource) {
        return PointType.NEW_SOURCE;
      } else if (this.input) {
        return PointType.NEW_CLAIM;
      }
      return null;
    },
    isNewClaim() {
      return this.pointType === PointType.NEW_CLAIM;
    },
    isNewSource() {
      return this.pointType === PointType.NEW_SOURCE;
    },
  },
  watch: {
    forceSource() {
      if (this.forceSource) {
        this.source.text = this.input;
      } else {
        this.input = this.source.text;
      }
    },
    input() {
      this.linkType = '';
    },
    isUrl() {
      if (this.isUrl) {
        this.source.url = this.input;
      }
    },
    show() {
      if (this.show) {
        this.initialize();
      }
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    close() {
      const p = this.makePoint();
      this.$emit('update', p || {});
      this.$emit('update:show', false);
    },
    cancel() {
      this.$emit('update:show', false);
    },
    makePoint() {
      const pointType = this.pointType;
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
    updateNewSource(source) {
      this.source = source;
      this.input = source.url;
    },
    updateLinkType(linkType) {
      this.linkType = linkType;
    },
    initialize() {
      this.input = '';
      if (this.point) {
        switch (this.point.pointType) {
          case PointType.NEW_CLAIM:
            this.input = this.point.text;
            this.flag = this.point.flag || null;
            break;
          case PointType.NEW_SOURCE:
            this.input = this.point.url;
            break;
        }
      }
    },
    validate(input) {
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
