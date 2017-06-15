<template>
<div class="t2" :class="['side-' + side]">
  <span class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
  <input type="text"
         autocomplete="off"
         placeholder="URL, new claim, or 12-letter ID"
         class="point-input"
         v-model="input1"
         :class="[inputClass]" />
  <input v-if="isUrl"
         type="text"
         autocomplete="off"
         placeholder="source description"
         class="point-input"
         v-model="input2" />
  <div v-if="claim">
    <router-link :to="'/claim/' + point.claim">{{ claim.text }}</router-link>
  </div>
  <template v-else-if="source">
    <div class="source-text">{{ source.text }}</div>
    <div class="source-url">{{ source.url }}</div>
  </template>
  <div v-else-if="isId">No claim or source with that ID found.</div>
</div>
</template>

<script>
import debounce from 'lodash/debounce';
import { isWebUri } from 'valid-url';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  props: ['point', 'side'],
  data: () => ({
    input1: '',
    input2: '',
  }),
  computed: {
    isId: function () {
      return ID_REGEX.test(this.input1);
    },
    isUrl: function () {
      return isWebUri(this.input1);
    },
    claim: function () {
      return this.isId ? this.$store.state.claims[this.input1] : null;
    },
    source: function () {
      return this.isId ? this.$store.state.sources[this.input1] : null;
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
  methods: {
    updatePoint: debounce(function () {
      delete this.point.newClaim;
      delete this.point.claim;
      delete this.point.source;
      delete this.point.newSource;
      delete this.point.text;
      if (this.claim) {
        this.point.claim = this.input1;
      } else if (this.source) {
        this.point.source = this.input1;
      } else if (this.isUrl) {
        this.point.newSource = {
          text: this.input2,
          url: this.input1,
        };
      } else {
        this.point.newClaim = {
          text: this.input1,
        };
      }
    }, 100),
  },
  mounted: function () {
    if (this.point) {
      this.input1 = this.point.claim || this.point.source || this.point.text;
    }
  },
  watch: {
    input1: function () {
      this.updatePoint();
    },
    input2: function () {
      this.updatePoint();
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
.point-input + * {
  margin-top: 0.5em;
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
