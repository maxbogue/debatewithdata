<template>
<li class="sub-point" :class="isFor | toSideString">
  <div class="bubble">
    <point-content class="content"
                   :point="point"
                   :trail="trail"></point-content>
    <div class="controls">
      <dwd-star :star="point.star" :url="'/api/point/' + point.id"></dwd-star>
      <span class="glyphicon glyphicon-comment click"
            aria-hidden="true"
            @click="showComments = !showComments"></span>
    </div>
  </div>
  <dwd-comments v-if="showComments"
                :url="'/api/point/' + point.id"></dwd-comments>
</li>
</template>

<script>
import './style/sub-point.sass';
import DwdComments from './DwdComments.vue';
import DwdStar from './DwdStar.vue';
import PointContent from './PointContent.vue';

export default {
  components: {
    DwdComments,
    DwdStar,
    PointContent,
  },
  props: ['point', 'isFor', 'trail'],
  data: () => ({
    showComments: false,
  }),
};
</script>
