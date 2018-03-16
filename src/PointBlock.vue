<template>
<li :class="pointClasses">
  <router-link v-if="pointUrl"
               class="bubble click"
               :to="pointUrl">
    <point-content :point="point" />
  </router-link>
  <point-content v-else
                 class="bubble"
                 :point="point" />
  <div class="info">
    <span class="id mono">{{ point.id }}</span>
    <icon-star :star="point.star" :url="'/api/point/' + point.id" />
    <icon-comment @click.native="showComments = !showComments"
                  :count="point.commentCount" />
  </div>
  <dwd-comments :url="'/api/point/' + point.id"
                :show="showComments" />
</li>
</template>

<script>
import './style/point.scss';
import DwdComments from './DwdComments.vue';
import IconComment from './IconComment.vue';
import IconStar from './IconStar.vue';
import PointContent from './PointContent.vue';
import { PointType } from '../common/constants';

export default {
  name: 'PointBlock',
  components: {
    DwdComments,
    IconComment,
    IconStar,
    PointContent,
  },
  props: {
    point: { type: Object, required: true },
    isFor: { type: Boolean, required: true },
    trail: { type: Array, default: null },
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    pointUrl: function () {
      if (!this.point) {
        return '';
      } else if (this.point.type === PointType.CLAIM) {
        return this.claimUrl(this.point.claimId, this.trail);
      } else if (this.point.type === PointType.SOURCE) {
        return this.sourceUrl(this.point.sourceId, this.trail);
      }
      return '';
    },
    pointClasses: function () {
      return [
        'point',
        this.$options.filters.toSideString(this.isFor),
      ];
    },
  },
};
</script>

<style lang="scss" module>
.subPointsMove {
  transition: transform 1s;
}
</style>
