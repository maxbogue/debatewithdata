<template>
  <div :class="classObject">
  <point-edit-modal :show.sync="showModal"
                    :point="point"
                    :isFor="isFor"
                    :isSubPoint="isSubPoint"
                    @update="emitPoint" />
  <template v-if="point.type">
    <point-diff class="bubble click"
                :curr="point"
                :prev="oldPoint"
                @click.native="showModal = true" />
    <div class="info">
      <span class="id mono">{{ point.id || 'new' }}</span>
      <span class="delete click glyphicon glyphicon-trash"
            aria-hidden="true"
            @click="$emit('delete')"></span>
    </div>
  </template>
  <div v-else class="bubble click" @click="showModal = true">
    <strong v-if="isSubPoint">
      Add a sub-point {{ isFor === isParentFor | toSideString }} this point.
    </strong>
    <strong v-else>Add a point {{ isFor | toSideString }} the claim.</strong>
  </div>
  <ul v-if="isSubClaim" class="sub-points">
    <point-edit v-for="[p, side, i] in zippedSubPoints"
                :point="p"
                :isFor="isFor === !side"
                :isParentFor="isFor"
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
import { emptyPoint, emptyPoints, pointMapsToLists, rotateWithIndexes }
  from './utils';

export default {
  name: 'PointEdit',
  components: {
    PointDiff,
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
    isParentFor: {
      type: Boolean,
      default: undefined,
    },
  },
  data: () => ({
    oldPoint: null,
    showModal: false,
    subPoints: emptyPoints(),
  }),
  computed: {
    isSubPoint: function () {
      return this.isParentFor !== undefined;
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
    updateSubPoint: function (si, pi, point) {
      if (!point.type) {
        if (pi > 0) {
          this.subPoints[si].splice(pi, 1);
        }
        return;
      }
      this.$set(this.subPoints[si], pi, point);
      if (pi === 0) {
        this.subPoints[si].splice(0, 0, emptyPoint());
      }
      this.updateSubClaim();
    },
    deleteSubPoint: function (si, pi) {
      this.subPoints[si].splice(pi, 1);
      this.updateSubClaim();
    },
  },
  mounted: function () {
    this.oldPoint = clone(this.point);
    if (this.point.points) {
      this.subPoints = pointMapsToLists(this.point.points);
      if (this.subPoints.length === 0) {
        this.subPoints.push([]);
        this.subPoints.push([]);
      }
      this.subPoints[0].splice(0, 0, emptyPoint());
      this.subPoints[1].splice(0, 0, emptyPoint());
    }
  },
};
</script>
