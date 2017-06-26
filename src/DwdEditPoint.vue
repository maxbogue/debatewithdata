<template>
<div class="t2" :class="['side-' + side]">
  <span v-if="canDelete"
        class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
  <input type="text"
         autocomplete="off"
         placeholder="URL, new claim, or 12-letter ID"
         v-model="input1"
         :class="[inputClass]" />
  <input v-if="isUrl"
         required
         type="text"
         autocomplete="off"
         placeholder="source description"
         v-model="input2" />
  <div v-if="claim">
    <router-link :to="claimUrl(point.id)">{{ claim.text }}</router-link>
  </div>
  <template v-else-if="source">
    <router-link :to="sourceUrl(point.id)" class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
  </template>
  <div v-else-if="isId">No claim or source with that ID found.</div>
</div>
</template>

<script>
import { isWebUri } from 'valid-url';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  props: ['point', 'side', 'canDelete'],
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
        return 'mono valid';
      } else if (this.isId) {
        return 'mono invalid';
      }
      return '';
    },
  },
  methods: {
    makePoint: function () {
      if (this.claim) {
        return {
          type: 'claim',
          id: this.input1,
        };
      } else if (this.source) {
        return {
          type: 'source',
          id: this.input1,
        };
      } else if (this.isUrl) {
        return {
          type: 'newSource',
          newSource: {
            text: this.input2,
            url: this.input1,
          },
        };
      } else if (this.input1) {
        return {
          type: 'newClaim',
          newClaim: {
            text: this.input1,
            points: [[], []],
          },
        };
      }
      return null;
    },
    updatePoint: function () {
      let p = this.makePoint();
      if (p) {
        this.$emit('update', p);
      }
    },
  },
  mounted: function () {
    if (this.point) {
      this.input1 = this.point.id || '';
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
.side-0 > input {
  background-color: #F3E5F5;
}
.side-1 > input {
  background-color: #FFF8E1;
}
.valid {
  color: #757575;
}
.invalid {
  color: #F44336;
}
</style>
