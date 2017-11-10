<template>
<li class="sub-point" :class="isFor | toSideString">
  <div class="bubble">
    <dwd-point-input class="content"
                     :point="point"
                     :isFor="isFor"
                     @update="updatePoint"></dwd-point-input>
    <div class="controls">
      <dwd-flag-dropdown v-if="point.type === 'text'"
                         :flag="point.flag"
                         @select="updateFlag"></dwd-flag-dropdown>
      <span v-if="canDelete"
            class="delete click glyphicon glyphicon-trash"
            aria-hidden="true"
            @click="$emit('delete')"></span>
    </div>
  </div>
</li>
</template>

<script>
import './style/sub-point.sass';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdPointInput from './DwdPointInput.vue';

export default {
  components: {
    DwdFlagDropdown,
    DwdPointInput,
  },
  props: ['point', 'isFor', 'canDelete'],
  data: () => ({
    flag: '',
  }),
  methods: {
    makeTextPoint: function (text) {
      let textPoint = {
        type: 'text',
        text: text,
      };
      if (this.flag) {
        textPoint.flag = this.flag;
      }
      return textPoint;
    },
    makePoint: function (type, input1, input2) {
      switch (type) {
      case 'claim':
        return { type, claimId: input1 };
      case 'source':
        return { type, sourceId: input1 };
      case 'newSource':
        return {
          type,
          newSource: {
            text: input2,
            url: input1,
          },
        };
      case 'text':
        return this.makeTextPoint(input1);
      default:
        return {};
      }
    },
    updatePoint: function (type, input1, input2) {
      this.emitPoint(this.makePoint(type, input1, input2));
    },
    updateTextPoint: function () {
      this.emitPoint(this.makeTextPoint(this.point.text));
    },
    updateFlag: function (flag) {
      this.flag = flag;
      this.updateTextPoint();
    },
    emitPoint: function (p) {
      if (this.point.id) {
        p.id = this.point.id;
      } else {
        p.tempId = this.point.tempId;
      }
      this.$emit('update', p);
    },
  },
  mounted: function () {
    this.flag = this.point.flag || '';
  },
};
</script>
