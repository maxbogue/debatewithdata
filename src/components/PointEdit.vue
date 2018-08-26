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
import '../style/point.scss';
import PointDiff from './PointDiff.vue';
import PointEditModal from './PointEditModal.vue';
import { PointType } from '@/common/constants';
import { splitPoints } from '@/utils';

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
    id() {
      let pointId = this.point ? this.point.id : '';
      let prevId = this.prev ? this.prev.id : '';
      return pointId || prevId;
    },
    isEditable() {
      if (!this.point) {
        return false;
      }
      return (
        this.point.pointType === PointType.NEW_CLAIM ||
        this.point.pointType === PointType.NEW_SOURCE
      );
    },
    isSubPoint() {
      return this.isParentFor !== null;
    },
    hasSubPoints() {
      if (!this.point) {
        return false;
      }
      return this.point.pointType === PointType.NEW_CLAIM && !this.isSubPoint;
    },
    pointClass() {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
  },
  watch: {
    showModal() {
      if (!this.showModal && !this.point.pointType) {
        this.emitPoint({});
      }
    },
  },
  beforeCreate() {
    this.$options.components.PointsEdit = require('./PointsEdit.vue').default;
  },
  mounted() {
    if (this.point && !this.point.pointType) {
      this.showModal = true;
    }
  },
  methods: {
    emitPoint(p) {
      if (this.point && this.point.tempId) {
        p.tempId = this.point.tempId;
      } else {
        p.id = this.id;
      }
      if (
        p.pointType === PointType.SUBCLAIM ||
        p.pointType === PointType.NEW_CLAIM
      ) {
        p = {
          ...p,
          ...splitPoints(this.subPoints),
        };
      }
      this.$emit('update', p);
    },
    updateSubPoints(newSubPoints) {
      this.subPoints = newSubPoints;
      if (this.point.pointType === PointType.NEW_CLAIM) {
        this.emitPoint({
          pointType: this.point.pointType,
          text: this.point.text,
          flag: this.point.flag,
        });
      }
    },
  },
};
</script>
