<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <bs-input type="textarea"
            autocomplete="off"
            placeholder="argument"
            v-model="point.text" />
  <span class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
</dwd-point-wrapper>
</template>

<script>
import { input } from 'vue-strap';
import DwdPointWrapper from './DwdPointWrapper.vue';

export default {
  components: {
    'bs-input': input,
    DwdPointWrapper,
  },
  props: ['points', 'sideIndex', 'pointIndex'],
  data: () => ({
  }),
  computed: {
    point: function () {
      return this.points[this.sideIndex][this.pointIndex];
    },
  },
  methods: {
  },
};
</script>

<style>
.delete {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
}
</style>
