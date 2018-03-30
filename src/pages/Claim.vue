<template>
<div>
  <dwd-trail :ids="newTrail" @lastIsFor="(v) => isFor = v" />
  <template v-if="claim">
    <div v-if="trail.length === 0">
      <item-block v-for="[item, type] in superItems"
                  :key="item.id"
                  :item="item"
                  :type="type"
                  abbreviated
                  is-link
                  mini />
    </div>
    <item-block :item="claim"
                :is-for="isFor"
                :trail="trail"
                type="claim"
                show-info />
    <template v-if="$store.state.singleColumn">
      <div v-if="zippedPoints.length > 0"
           class="block no-pad"
           :class="$style.pointHeader"
           :key="id + '-side-text'">
        <span :class="claimIsFor ? $style.for : $style.against"
              >For</span>
        <span> // </span>
        <span :class="claimIsFor ? $style.against : $style.for"
              >Against</span>
      </div>
      <item-block v-for="[point, side] in zippedPoints"
                  :item="point"
                  :type="point.pointType"
                  :is-for="claimIsFor === !side"
                  :trail="newTrail"
                  :key="point.id"
                  is-link />
    </template>
    <template v-else>
      <div v-for="(sidePoints, side) in points"
           class="dwd-col"
           :key="'side-' + side">
        <div v-if="sidePoints.length > 0"
             class="block no-pad"
             :class="$style.pointHeader"
             :key="id + 'side-text-' + side">
          <span :class="claimIsFor === !side ? $style.for : $style.against"
                >{{ !side ? 'For' : 'Against' }}</span>
        </div>
        <item-block v-for="point in sidePoints"
                    :item="point"
                    :type="point.pointType"
                    :is-for="claimIsFor === !side"
                    :trail="newTrail"
                    :key="point.id"
                    is-link />
      </div>
    </template>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import map from 'lodash/map';

import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import ItemBlock from '../ItemBlock.vue';
import { combineAndSortPoints, rotateWithIndexes } from '../utils';

export default {
  components: {
    DwdLoader,
    DwdTrail,
    ItemBlock,
  },
  data: () => ({
    showComments: false,
    isFor: null,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    claim: function () {
      return this.lookupClaim(this.id);
    },
    claimIsFor: function () {
      return this.isFor !== null ? this.isFor : true;
    },
    points: function () {
      if (!this.claim || this.claim.deleted || this.claim.depth < 2) {
        return [];
      }
      return combineAndSortPoints(this.claim, this.$store.state);
    },
    zippedPoints: function () {
      return rotateWithIndexes(this.points);
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
    newTrail: function () {
      return this.trail.concat(this.id);
    },
    superItems: function () {
      if (!this.claim) {
        return [];
      }

      let superTopics = map(this.claim.superTopicIds || [],
          (id) => [this.lookupTopic(id), 'topic']);
      let superClaims = map(this.claim.superClaimIds || [],
          (id) => [this.lookupClaim(id), 'claim']);
      return superTopics.concat(superClaims);
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
  methods: {
    checkLoaded: function () {
      let claim = this.claim;
      if (!claim || claim.depth < 3) {
        this.$store.dispatch('getClaim', {
          id: this.id,
          trail: this.trail,
          loader: !claim || claim.depth < 2 ? this.$refs.loader : null,
        });
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.pointHeader {
  display: flex;
  font-size: 1.25em;
  text-align: center;

  &:global(.block) > span {
    margin-top: 0;
  }

  .for {
    flex: 1;
    color: $purple-dark-primary;
  }

  .against {
    flex: 1;
    color: $amber-dark-primary;
  }
}
</style>
