<template>
<div :class="pointClass">
  <point-edit-modal v-if="point"
                    :show.sync="showModal"
                    :point="point"
                    :is-for="isFor"
                    @update="emitPoint" />
  <point-diff class="bubble"
              :class="{ click: isEditable }"
              :curr="point"
              :prev="prev"
              @click.native="showModal = isEditable" />
  <div class="info">
    <span class="id mono">{{ id || 'new' }}</span>
    <span class="delete click fas fa-trash" @click="$emit('delete')"></span>
  </div>
  <points-edit v-if="hasSubPoints"
               :curr="point"
               :prev="prev"
               :is-for="isFor"
               @update="updateSubPoints" />
</div>
</template>

<script>
import './style/point.scss';
import PointDiff from './PointDiff.vue';
import PointEditModal from './PointEditModal.vue';
import { PointType } from '../common/constants';

export default {
  name: 'PointEdit',
  components: {
    PointDiff,
    PointEditModal,
  },
  props: {
    point: { type: Object, default: null },
    prev: { type: Object, default: null },
    isFor: { type: Boolean, required: true },
    isParentFor: { type: Boolean, default: null },
  },
  data: () => ({
    showModal: false,
    subPoints: [[], []],
  }),
  computed: {
    id: function () {
      let pointId = this.point ? this.point.id || this.point.tempId : '';
      let prevId = this.prev ? this.prev.id : '';
      return pointId || prevId;
    },
    isEditable: function () {
      if (!this.point) {
        return false;
      }
      return this.point.type === PointType.NEW_CLAIM
          || this.point.type === PointType.NEW_SOURCE;
    },
    isSubPoint: function () {
      return this.isParentFor !== null;
    },
    hasSubPoints: function () {
      if (!this.point) {
        return false;
      }
      return this.point.type === PointType.NEW_CLAIM && !this.isSubPoint;
    },
    pointClass: function () {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
  },
  beforeCreate: function () {
    this.$options.components.PointsEdit = require('./PointsEdit.vue').default;
  },
  mounted: function () {
    if (this.point && !this.point.type) {
      this.showModal = true;
    }
  },
  methods: {
    emitPoint: function (p) {
      if (this.point && this.point.tempId) {
        p.tempId = this.point.tempId;
      } else {
        p.id = this.id;
      }
      if (p.type === PointType.SUBCLAIM || p.type === PointType.NEW_CLAIM) {
        p.points = this.subPoints;
      }
      this.$emit('update', p);
    },
    updateSubPoints: function (newSubPoints) {
      this.subPoints = newSubPoints;
      if ([PointType.SUBCLAIM, PointType.NEW_CLAIM].includes(this.point.type)) {
        this.emitPoint({
          type: this.point.type,
          text: this.point.text,
          flag: this.point.flag,
        });
      }
    },
  },
};
</script>
