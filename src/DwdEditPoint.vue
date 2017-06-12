<template>
<dwd-point-wrapper v-if="point"
                   :points="points"
                   :sideIndex="sideIndex"
                   :pointIndex="pointIndex">
  <span class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
  <input type="text"
         autocomplete="off"
         placeholder="12-letter ID"
         class="input-text"
         v-model="text"
         :class="[inputClass]" />
  <span v-if="claim">Claim: {{ claim.text }}</span>
  <span v-else-if="source">Source: {{ source.text }}</span>
  <span v-else-if="isId">No claim or source with that ID found.</span>
</dwd-point-wrapper>
</template>

<script>
import DwdPointWrapper from './DwdPointWrapper.vue';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdPointWrapper,
  },
  props: ['points', 'sideIndex', 'pointIndex'],
  data: () => ({
    text: '',
  }),
  computed: {
    point: function () {
      return this.points[this.sideIndex][this.pointIndex];
    },
    isId: function () {
      return ID_REGEX.test(this.text);
    },
    claim: function () {
      return this.isId ? this.$store.state.claims[this.text] : null;
    },
    source: function () {
      return this.isId ? this.$store.state.sources[this.text] : null;
    },
    inputClass: function () {
      if (this.claim || this.source) {
        return 'id valid';
      } else if (this.isId) {
        return 'id invalid';
      }
      return '';
    },
  },
  mounted: function () {
    if (this.point) {
      this.text = this.point.claim || this.point.source || this.point.text;
    }
  },
  watch: {
    text: function () {
      if (this.claim) {
        delete this.point.text;
        delete this.point.source;
        this.point.claim = this.text;
      } else if (this.source) {
        delete this.point.claim;
        delete this.point.text;
        this.point.source = this.text;
      } else {
        delete this.point.claim;
        delete this.point.source;
        this.point.text = this.text;
      }
    },
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
.input-text {
  border: 1px solid #666;
  display: block;
  padding: 0.5em;
  transition: width 0.5s;
  width: 100%;
}
.id {
  display: inline-block;
  width: 8em;
}
.valid {
  background-color: #CCFF90;
  border: 1px solid #64DD17;
}
.invalid {
  background-color: #FF8A80;
  border: 1px solid #D50000;
}
</style>
