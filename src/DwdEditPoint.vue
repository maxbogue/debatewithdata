<template>
<div class="point" :class="isFor | toSideString">
  <point-edit-modal :show.sync="showModal"
                    :point="point"
                    :isFor="isFor"
                    @update="emitPoint" />
  <point-content v-if="point.type"
                 class="bubble click"
                 :point="point"
                 @click.native="showModal = true" />
  <div v-else class="bubble click" @click="showModal = true">
    <strong>Add a point {{ isFor | toSideString }} the claim.</strong>
  </div>
  <div v-if="point.type" class="info">
    <span class="id mono">{{ point.id || 'new' }}</span>
    <span v-if="canDelete"
          class="delete click glyphicon glyphicon-trash"
          aria-hidden="true"
          @click="$emit('delete')"></span>
  </div>
  <ul v-if="isSubClaim" class="sub-points">
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
import PointContent from './PointContent.vue';
import PointEditModal from './PointEditModal.vue';
import { emptyPoint, emptyPoints, pointMapsToLists, rotateWithIndexes }
  from './utils';

export default {
  components: {
    DwdEditSubpoint,
    PointContent,
    PointEditModal,
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
    showModal: false,
    subpoints: emptyPoints(),
  }),
  computed: {
    isSubClaim: function () {
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
    emitPoint: function (p) {
      if (this.point.id) {
        p.id = this.point.id;
      } else {
        p.tempId = this.point.tempId;
      }
      if (p.type === 'subclaim') {
        p.points = this.subpoints;
      }
      this.$emit('update', p);
    },
    updateSubClaim: function () {
      this.emitPoint({
        type: 'subclaim',
        text: this.point.text,
        flag: this.point.flag,
      });
    },
    updateSubPoint: function (si, pi, point) {
      this.$set(this.subpoints[si], pi, point);
      if (pi === 0) {
        this.subpoints[si].splice(0, 0, emptyPoint());
      }
      this.updateSubClaim();
    },
    deleteSubPoint: function (si, pi) {
      this.subpoints[si].splice(pi, 1);
      this.updateSubClaim();
    },
  },
  mounted: function () {
    if (this.point.points) {
      this.subpoints = pointMapsToLists(this.point.points);
      if (this.subpoints.length === 0) {
        this.subpoints.push([]);
        this.subpoints.push([]);
      }
      this.subpoints[0].splice(0, 0, emptyPoint());
      this.subpoints[1].splice(0, 0, emptyPoint());
    }
  },
};
</script>
