<template>
<li class="sub-point" :class="isFor | toSideString">
  <div class="bubble">
    <div class="content">
      <dwd-point-input :point="point" :isFor="isFor" @update="updatePoint">
      </dwd-point-input>
    </div>
    <div class="controls">
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
import DwdPointInput from './DwdPointInput.vue';

export default {
  components: {
    DwdPointInput,
  },
  props: ['point', 'isFor', 'canDelete'],
  methods: {
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
        return { type, text: input1 };
      default:
        return {};
      }
    },
    updatePoint: function (type, input1, input2) {
      this.emitPoint(this.makePoint(type, input1, input2));
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
};
</script>
