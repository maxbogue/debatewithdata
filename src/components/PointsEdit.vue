<template>
  <div v-if="isSubPoints || $store.state.singleColumn">
    <div class="block click" :class="pointClass(isFor)" @click="addPoint(0)">
      <strong v-if="isSubPoints">Add a sub-point for this point.</strong>
      <strong v-else>Add a point for this claim.</strong>
    </div>
    <div class="block click" :class="pointClass(!isFor)" @click="addPoint(1)">
      <strong v-if="isSubPoints">Add a sub-point against this point.</strong>
      <strong v-else>Add a point against this claim.</strong>
    </div>
    <point-edit
      v-for="[[pointId, point, prev], side] in zippedPointDiffs"
      :key="pointId"
      :point="point"
      :prev="prev"
      :is-for="isSubPoints ? isFor === !side : !side"
      :is-parent-for="isFor"
      @update="p => updatePoint(side, p)"
      @delete="deletePoint(side, point || prev)"
    />
  </div>
  <div v-else class="dwd-cols">
    <div
      v-for="(sidePoints, side) in pointDiffs"
      class="dwd-col"
      :key="'side-' + side"
    >
      <div
        class="block click"
        :class="pointClass(!side)"
        @click="addPoint(side)"
      >
        <strong v-if="isSubPoints"
          >Add a sub-point {{ !side | toSideString }} this point.</strong
        >
        <strong v-else
          >Add a point {{ !side | toSideString }} this claim.</strong
        >
      </div>
      <point-edit
        v-for="[pointId, point, prev] in sidePoints"
        :key="pointId"
        :point="point"
        :prev="prev"
        :is-for="isSubPoints ? isFor === !side : !side"
        :is-parent-for="isFor"
        @update="p => updatePoint(side, p)"
        @delete="deletePoint(side, point || prev)"
      />
    </div>
  </div>
</template>

<script>
import findIndex from 'lodash/fp/findIndex';
import sortBy from 'lodash/fp/sortBy';
import { mapGetters } from 'vuex';

import PointEdit from './PointEdit.vue';
import { diffPoints, emptyPoint, rotateWithIndexes } from '@/utils';

function matchPoint(p) {
  return q => (p.id && p.id === q.id) || (p.tempId && p.tempId === q.tempId);
}

export default {
  components: {
    PointEdit,
  },
  props: {
    curr: { type: Object, default: null },
    prev: { type: Object, default: null },
    isFor: { type: Boolean, default: null },
    initAddPoint: { type: Number, default: -1 },
  },
  data: () => ({
    points: [[], []],
    pointOrder: null,
  }),
  computed: {
    ...mapGetters('sort', ['combineAndSortPoints']),
    isSubPoints() {
      return this.isFor !== null;
    },
    pointDiffs() {
      let pointDiffs = diffPoints(
        { points: this.points },
        this.prev,
        this.$store.state
      );
      if (this.pointOrder) {
        // Sort by the point order.
        pointDiffs = pointDiffs.map((ps, si) =>
          sortBy(p => this.pointOrder[si].indexOf(p[0]), ps)
        );
      }
      return pointDiffs;
    },
    zippedPointDiffs() {
      return rotateWithIndexes(this.pointDiffs);
    },
  },
  watch: {
    pointDiffs: {
      immediate: true,
      handler() {
        if (!this.pointOrder) {
          // Initialize pointOrder with the order from diffPoints.
          this.pointOrder = this.pointDiffs.map(s => s.map(([id]) => id));
        }
      },
    },
  },
  mounted() {
    if (this.curr) {
      this.points = this.combineAndSortPoints(this.curr);
    }
    if (this.initAddPoint >= 0) {
      this.addPoint(this.initAddPoint);
    }
  },
  methods: {
    pointClass(isFor) {
      return [
        this.isSubPoints ? 'sub-point' : 'point',
        this.$options.filters.toSideString(isFor),
      ];
    },
    addPoint(si) {
      const newPoint = emptyPoint();
      this.pointOrder[si].splice(0, 0, newPoint.tempId);
      this.points[si].splice(0, 0, newPoint);
    },
    updatePoint(si, point) {
      const pi = findIndex(matchPoint(point), this.points[si]);
      if (pi < 0) {
        this.points[si].push(point);
      } else {
        if (!point.pointType) {
          this.points[si].splice(pi, 1);
          return;
        }
        this.$set(this.points[si], pi, point);
      }
      this.$emit('update', this.points);
    },
    deletePoint(si, point) {
      const pi = findIndex(matchPoint(point), this.points[si]);
      if (pi < 0) {
        this.points[si].push(point);
      } else {
        this.points[si].splice(pi, 1);
      }
      this.$emit('update', this.points);
    },
  },
};
</script>
