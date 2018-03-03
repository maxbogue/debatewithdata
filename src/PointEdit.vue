<template>
<div :class="classObject">
  <point-edit-modal v-if="point"
                    :show.sync="showModal"
                    :point="point"
                    :is-for="isFor"
                    :is-sub-point="isSubPoint"
                    @update="emitPoint" />
  <point-diff class="bubble"
              :class="{ click: point }"
              :curr="point"
              :prev="prev"
              @click.native="showModal = !!point && true" />
  <div class="info">
    <span class="id mono">{{ id || 'new' }}</span>
    <span class="delete click fas fa-trash" @click="$emit('delete')"></span>
  </div>
  <ul v-if="isSubClaim" class="sub-points">
    <div class="sub-point block click"
         :class="isFor | toSideString"
         @click="addSubPoint(0)">
      <strong>Add a sub-point for this point.</strong>
    </div>
    <div class="sub-point block click"
         :class="!isFor | toSideString"
         @click="addSubPoint(1)">
      <strong>Add a sub-point against this point.</strong>
    </div>
    <point-edit v-for="[[spId, sp, prevSp], side] in zippedSubPointRevs"
                :point="sp"
                :prev="prevSp"
                :is-for="isFor === !side"
                :is-parent-for="isFor"
                :key="spId"
                @update="(p) => updateSubPoint(side, p)"
                @delete="deleteSubPoint(side, sp || prevSp)" />
  </ul>
</div>
</template>

<script>
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import './style/point.sass';
import PointDiff from './PointDiff.vue';
import PointEditModal from './PointEditModal.vue';
import { diffPointRevs, emptyPoint, pointMapsToLists, rotateWithIndexes }
  from './utils';
import { PointType } from '../common/constants';

function matchPoint(p) {
  return (q) => p.id && p.id === q.id || p.tempId && p.tempId === q.tempId;
}

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
    pointOrder: null,
  }),
  computed: {
    id: function () {
      let pointId = this.point ? this.point.id || this.point.tempId : '';
      let prevId = this.prev ? this.prev.id : '';
      return pointId || prevId;
    },
    isSubPoint: function () {
      return this.isParentFor !== null;
    },
    isSubClaim: function () {
      if (!this.point) {
        return false;
      }
      return this.point.type === PointType.SUBCLAIM
          || this.point.type === PointType.NEW_CLAIM && !this.isSubPoint;
    },
    subPointRevs: function () {
      let pointRevs = diffPointRevs({ points: this.subPoints }, this.prev);
      if (this.pointOrder) {
        // Sort by the point order.
        pointRevs = map(pointRevs, (ps, si) =>
          sortBy(ps, (p) => this.pointOrder[si].indexOf(p[0])));
      }
      return pointRevs;
    },
    zippedSubPointRevs: function () {
      return rotateWithIndexes(this.subPointRevs);
    },
    classObject: function () {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
  },
  watch: {
    subPointRevs: function () {
      if (!this.pointOrder) {
        // Initialize pointOrder with the order from diffPointRevs.
        this.pointOrder = map(this.subPointRevs, (s) => map(s, ([id]) => id));
      }
    },
  },
  mountedTriggersWatchers: true,
  mounted: function () {
    if (this.point && this.point.points) {
      this.subPoints = pointMapsToLists(this.point.points);
    }
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
    updateSubClaim: function () {
      if ([PointType.SUBCLAIM, PointType.NEW_CLAIM].includes(this.point.type)) {
        this.emitPoint({
          type: this.point.type,
          text: this.point.text,
          flag: this.point.flag,
        });
      }
    },
    addSubPoint: function (si) {
      let newPoint = emptyPoint();
      this.pointOrder[si].splice(0, 0, newPoint.tempId);
      this.subPoints[si].splice(0, 0, newPoint);
    },
    updateSubPoint: function (si, point) {
      let pi = findIndex(this.subPoints[si], matchPoint(point));
      if (pi < 0) {
        this.subPoints[si].push(point);
      } else {
        if (!point.type) {
          this.subPoints[si].splice(pi, 1);
          return;
        }
        this.$set(this.subPoints[si], pi, point);
      }
      this.updateSubClaim();
    },
    deleteSubPoint: function (si, point) {
      let pi = findIndex(this.subPoints[si], matchPoint(point));
      if (pi < 0) {
        this.subPoints[si].push(point);
      } else {
        this.subPoints[si].splice(pi, 1);
      }
      this.updateSubClaim();
    },
  },
};
</script>
