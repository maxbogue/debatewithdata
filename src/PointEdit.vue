<template>
<div :class="classObject">
  <point-edit-modal :show.sync="showModal"
                    :point="point"
                    :is-for="isFor"
                    :is-sub-point="isSubPoint"
                    @update="emitPoint" />
  <point-diff class="bubble click"
              :curr="point"
              :prev="oldPoint"
              @click.native="showModal = true" />
  <div class="info">
    <span class="id mono">{{ point.id || 'new' }}</span>
    <span class="delete click fas fa-trash" @click="$emit('delete')" />
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
    <point-edit v-for="[p, side, i] in zippedSubPoints"
                :point="p"
                :is-for="isFor === !side"
                :is-parent-for="isFor"
                :key="p.id || p.tempId"
                @update="(p) => updateSubPoint(side, i, p)"
                @delete="() => deleteSubPoint(side, i)" />
  </ul>
</div>
</template>

<script>
import clone from 'lodash/clone';

import './style/point.sass';
import PointDiff from './PointDiff.vue';
import PointEditModal from './PointEditModal.vue';
import { emptyPoint, pointMapsToLists, rotateWithIndexes }
  from './utils';

export default {
  name: 'PointEdit',
  components: {
    PointDiff,
    PointEditModal,
  },
  props: {
    point: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
    isParentFor: { type: Boolean, default: null },
  },
  data: () => ({
    oldPoint: null,
    showModal: false,
    subPoints: [[], []],
  }),
  computed: {
    isSubPoint: function () {
      return this.isParentFor !== null;
    },
    isSubClaim: function () {
      return this.point.type === 'subclaim';
    },
    zippedSubPoints: function () {
      if (!this.subPoints) {
        return [];
      }
      return rotateWithIndexes(this.subPoints);
    },
    classObject: function () {
      return [
        this.isSubPoint ? 'sub-point' : 'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
  },
  mounted: function () {
    this.oldPoint = clone(this.point);
    if (this.point.points) {
      this.subPoints = pointMapsToLists(this.point.points);
    }
    if (!this.point.type) {
      this.showModal = true;
    }
  },
  methods: {
    emitPoint: function (p) {
      if (this.point.id) {
        p.id = this.point.id;
      } else {
        p.tempId = this.point.tempId;
      }
      if (p.type === 'subclaim') {
        p.points = this.subPoints;
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
    addSubPoint: function (si) {
      this.subPoints[si].splice(0, 0, emptyPoint());
    },
    updateSubPoint: function (si, pi, point) {
      if (!point.type) {
        this.subPoints[si].splice(pi, 1);
        return;
      }
      this.$set(this.subPoints[si], pi, point);
      this.updateSubClaim();
    },
    deleteSubPoint: function (si, pi) {
      this.subPoints[si].splice(pi, 1);
      this.updateSubClaim();
    },
  },
};
</script>
