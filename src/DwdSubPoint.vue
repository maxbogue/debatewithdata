<template>
<li class="sub-point" :class="isFor | toSideString">
  <point-content class="bubble click"
                 @click.native="showDrawer = !showDrawer"
                 :point="point"
                 :trail="trail"></point-content>
  <drawer v-if="showDrawer">
    <div class="info">
      <dwd-star :star="point.star" :url="'/api/point/' + point.id"></dwd-star>
      <span class="glyphicon glyphicon-comment click"
            aria-hidden="true"
            @click="showComments = !showComments"></span>
    </div>
    <dwd-comments v-if="showComments"
                  :url="'/api/point/' + point.id"></dwd-comments>
  </drawer>
</li>
</template>

<script>
import './style/sub-point.sass';
import Drawer from './Drawer.vue';
import DwdComments from './DwdComments.vue';
import DwdStar from './DwdStar.vue';
import PointContent from './PointContent.vue';

export default {
  components: {
    Drawer,
    DwdComments,
    DwdStar,
    PointContent,
  },
  props: ['point', 'isFor', 'trail'],
  data: () => ({
    showComments: false,
    showDrawer: false,
  }),
};
</script>
