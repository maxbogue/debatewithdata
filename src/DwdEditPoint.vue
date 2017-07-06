<template>
<div class="t2" :class="['side-' + side]">
  <span v-if="canDelete"
        class="delete click glyphicon glyphicon-trash"
        aria-hidden="true"
        @click="$emit('delete')"></span>
  <textarea rows="1"
            autocomplete="off"
            placeholder="New sub-claim, URL, or 12-letter ID"
            ref="input1"
            v-model="input1"
            v-auto-resize
            :class="[inputClass]" />
  <textarea v-if="isUrl"
            rows="1"
            autocomplete="off"
            placeholder="source description"
            ref="input2"
            v-model="input2"
            v-auto-resize />
  <router-link v-if="claim"
               class="source-text"
               :to="claimUrl(point.id) + '/edit'">{{ claim.text }}</router-link>
  <template v-else-if="source">
    <router-link :to="sourceUrl(point.id) + '/edit'" class="source-text">{{ source.text }}</router-link>
    <a :href="source.url" class="source-url">{{ source.url }}</a>
  </template>
  <div v-else-if="isId">No claim or source with that ID found.</div>
  <ul v-else-if="zippedSubpoints.length > 0" class="t3 editing">
    <dwd-edit-subpoint v-for="[p, side, i] in zippedSubpoints"
                       :point="p"
                       :side="side"
                       :key="'subpoint-' + side + '-' + i"
                       @update="(p) => updateSubpoint(side, i, p)"
                       @delete="this.subpoints[side].splice(i, 1)"></dwd-edit-subpoint>
  </ul>
</div>
</template>

<script>
import { cloneDeep, filter } from 'lodash';
import { isWebUri } from 'valid-url';

import DwdEditSubpoint from './DwdEditSubpoint.vue';
import { isValidPoint, rotateWithIndexes } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdEditSubpoint,
  },
  props: ['point', 'side', 'canDelete'],
  data: () => ({
    input1: '',
    input2: '',
    subpoints: [[], []],
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
    zippedSubpoints: function () {
      if (!this.subpoints) return [];
      return rotateWithIndexes(this.subpoints);
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
        let subpoints = cloneDeep(this.subpoints);
        for (let i = 0; i < subpoints.length; i++) {
          subpoints[i] = filter(subpoints[i], isValidPoint);
        }
        return {
          type: 'subclaim',
          text: this.input1,
          points: subpoints,
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
    updateSubpoint: function (si, pi, point) {
      this.$set(this.subpoints[si], pi, point);
      if (pi === this.subpoints[si].length - 1) {
        this.subpoints[si].push({});
      }
      this.updatePoint();
    },
    setError: function () {
      let error1 = '';
      let error2 = '';
      if (this.isId && !this.claim && !this.source) {
        error1 = 'Invalid ID';
      } else if (this.isUrl && !this.input2) {
        error2 = 'Source description required';
      }
      this.$refs.input1.setCustomValidity(error1);
      if (this.$refs.input2) {
        this.$refs.input2.setCustomValidity(error2);
      }
    },
  },
  mounted: function () {
    if (this.point) {
      this.input1 = this.point.id || this.point.text || '';
    }
    if (this.point.points) {
      this.subpoints = cloneDeep(this.point.points);
      if (this.subpoints.length === 0) {
        this.subpoints.push([]);
        this.subpoints.push([]);
      }
      this.subpoints[0].push({});
      this.subpoints[1].push({});
    }
  },
  watch: {
    input1: function () {
      this.updatePoint();
      this.setError();
    },
    input2: function () {
      this.updatePoint();
      this.setError();
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
.t2 textarea + * {
  margin-top: 8px;
}
.t3.editing li:before {
  line-height: 2;
}
</style>
