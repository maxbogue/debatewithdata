<template>
<div class="point" :class="isFor | toSideString">
  <dwd-point-input class="bubble"
                   :point="point"
                   :isFor="isFor"
                   @update="updatePoint"></dwd-point-input>
  <div v-if="point.type" class="info">
    <span class="id mono">{{ point.id || 'new' }}</span>
    <dwd-flag-dropdown v-if="isSubclaim"
                       :flag="flag"
                       @select="updateFlag"></dwd-flag-dropdown>
    <span v-if="canDelete"
          class="delete click glyphicon glyphicon-trash"
          aria-hidden="true"
          @click="$emit('delete')"></span>
  </div>
  <ul v-if="isSubclaim" class="sub-points">
    <dwd-edit-subpoint v-for="[p, side, i] in zippedSubpoints"
                       :point="p"
                       :isFor="isFor === !side"
                       :canDelete="i < subpoints[side].length - 1"
                       :key="p.id || p.tempId"
                       @update="(p) => updateSubPoint(side, i, p)"
                       @delete="() => deleteSubPoint(side, i)">
    </dwd-edit-subpoint>
  </ul>
</div>
</template>

<script>
import './style/point.sass';
import DwdEditSubpoint from './DwdEditSubpoint.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import DwdPointInput from './DwdPointInput.vue';
import { emptyPoint, emptyPoints, pointMapsToLists, rotateWithIndexes }
  from './utils';

export default {
  components: {
    DwdEditSubpoint,
    DwdFlagDropdown,
    DwdPointInput,
  },
  props: {
    point: {
      type: Object,
      required: true,
    },
    isFor: {
      type: Boolean,
      required: true,
    },
    canDelete: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    subpoints: emptyPoints(),
    flag: '',
  }),
  computed: {
    isSubclaim: function () {
      return this.point.type === 'subclaim';
    },
    zippedSubpoints: function () {
      if (!this.subpoints) {
        return [];
      }
      return rotateWithIndexes(this.subpoints);
    },
  },
  methods: {
    makeSubClaim: function (text) {
      let subClaim = {
        type: 'subclaim',
        text: text,
        points: this.subpoints,
      };
      if (this.flag) {
        subClaim.flag = this.flag;
      }
      return subClaim;
    },
    makePoint: function (type, input1, input2) {
      switch (type) {
      case 'claim':
        return { type, claimId: input1 };
      case 'source':
        return { type, sourceId: input1 };
      case 'newSource':
        return {
          type: 'newSource',
          newSource: {
            text: input2,
            url: input1,
          },
        };
      case 'text':
        return this.makeSubClaim(input1);
      default:
        return {};
      }
    },
    updatePoint: function (type, input1, input2) {
      this.emitPoint(this.makePoint(type, input1, input2));
    },
    updateSubClaim: function () {
      this.emitPoint(this.makeSubClaim(this.point.text));
    },
    updateSubPoint: function (si, pi, point) {
      this.$set(this.subpoints[si], pi, point);
      if (pi === this.subpoints[si].length - 1) {
        this.subpoints[si].push(emptyPoint());
      }
      this.updateSubClaim();
    },
    deleteSubPoint: function (si, pi) {
      this.subpoints[si].splice(pi, 1);
      this.updateSubClaim();
    },
    updateFlag: function (flag) {
      this.flag = flag;
      this.updateSubClaim();
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
    if (this.point.points) {
      this.subpoints = pointMapsToLists(this.point.points);
      if (this.subpoints.length === 0) {
        this.subpoints.push([]);
        this.subpoints.push([]);
      }
      this.subpoints[0].push(emptyPoint());
      this.subpoints[1].push(emptyPoint());
    }
  },
};
</script>
