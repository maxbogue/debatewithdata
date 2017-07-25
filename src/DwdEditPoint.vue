<template>
<div class="point t2 flex-row" :class="['side-' + side]">
  <div class="content">
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
    <dwd-flag v-if="flag" :flag="flag"></dwd-flag>
    <router-link v-if="claim"
                 class="source-text"
                 :to="claimUrl(point.id) + '/edit'">
      {{ claim.text }}
    </router-link>
    <template v-else-if="source">
      <router-link :to="sourceUrl(point.id) + '/edit'"
                   class="source-text">{{ source.text }}</router-link>
      <a :href="source.url" class="source-url">{{ source.url }}</a>
    </template>
    <div v-else-if="isId">No claim or source with that ID found.</div>
    <ul v-else-if="isSubclaim" class="t3">
      <dwd-edit-subpoint v-for="[p, side, i] in zippedSubpoints"
                         :point="p"
                         :side="side"
                         :canDelete="i < subpoints[side].length - 1"
                         :key="p.id || p.tempId"
                         @update="(p) => updateSubpoint(side, i, p)"
                         @delete="subpoints[side].splice(i, 1)">
      </dwd-edit-subpoint>
    </ul>
  </div>
  <div class="controls">
    <dwd-flag-dropdown v-if="isSubclaim"
                       :flag="flag"
                       @select="updateFlag"></dwd-flag-dropdown>
    <span v-if="canDelete"
          class="delete click glyphicon glyphicon-trash"
          aria-hidden="true"
          @click="$emit('delete')"></span>
  </div>
</div>
</template>

<script>
import { cloneDeep, filter } from 'lodash';
import { isWebUri } from 'valid-url';

import DwdEditSubpoint from './DwdEditSubpoint.vue';
import DwdFlag from './DwdFlag.vue';
import DwdFlagDropdown from './DwdFlagDropdown.vue';
import { emptyPoint, emptyPoints, isValidPoint, pointToInput,
         rotateWithIndexes } from './utils';

const ID_REGEX = /^[0-9a-f]{12}$/;

export default {
  components: {
    DwdEditSubpoint,
    DwdFlag,
    DwdFlagDropdown,
  },
  props: ['point', 'side', 'canDelete'],
  data: () => ({
    input1: '',
    input2: '',
    subpoints: emptyPoints(),
    flag: '',
  }),
  computed: {
    isId: function () {
      return ID_REGEX.test(this.input1);
    },
    isUrl: function () {
      return isWebUri(this.input1);
    },
    isSubclaim: function () {
      return this.input1 && !this.isId && !this.isUrl;
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
        let subclaim = {
          type: 'subclaim',
          text: this.input1,
          points: subpoints,
          flag: this.flag,
        };
        if (this.point.id) {
          subclaim.id = this.point.id;
        } else {
          subclaim.tempId = this.point.tempId;
        }
        return subclaim;
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
        this.subpoints[si].push(emptyPoint());
      }
      this.updatePoint();
    },
    updateFlag: function (flag) {
      this.flag = flag;
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
    this.input1 = pointToInput(this.point);
    this.flag = this.claim ? this.claim.flag : this.point.flag;
    if (this.point.points) {
      this.subpoints = cloneDeep(this.point.points);
      if (this.subpoints.length === 0) {
        this.subpoints.push([]);
        this.subpoints.push([]);
      }
      this.subpoints[0].push(emptyPoint());
      this.subpoints[1].push(emptyPoint());
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
