<template>
  <div>
    <dwd-trail :ids="newTrail" @lastIsFor="v => (isFor = v)" />
    <div v-if="trail.length === 0">
      <item-block
        v-for="[item, type] in superItems"
        :key="item.id"
        :item="item"
        :type="type"
        abbreviated
        is-link
        mini
        half
      />
    </div>
    <item-block
      :item="claim"
      :is-for="isFor"
      :trail="trail"
      type="claim"
      show-info
    />
    <template v-if="$store.state.singleColumn">
      <div
        class="block no-pad"
        :class="$style.pointHeader"
        :key="id + '-side-text'"
      >
        <div :class="sideClass(0)">
          <span>For</span>
          <icon-add :id="id" :extras="{ initAddPoint: 0 }" type="claim" />
        </div>
        <div :class="sideClass(1)">
          <span>Against</span>
          <icon-add :id="id" :extras="{ initAddPoint: 1 }" type="claim" />
        </div>
      </div>
      <item-block
        v-for="[point, side] in zippedPoints"
        :item="point"
        :type="point.pointType"
        :is-for="claimIsFor === !side"
        :trail="newTrail"
        :key="point.id"
        is-link
      />
    </template>
    <div v-else class="dwd-cols">
      <div
        v-for="(sidePoints, side) in points"
        class="dwd-col"
        :key="'side-' + side"
      >
        <div
          class="block no-pad"
          :class="[$style.pointHeader, sideClass(side)]"
          :key="id + 'side-text-' + side"
        >
          <span>{{ !side ? 'For' : 'Against' }}</span>
          <icon-add :id="id" :extras="{ initAddPoint: side }" type="claim" />
        </div>
        <item-block
          v-for="point in sidePoints"
          :item="point"
          :type="point.pointType"
          :is-for="claimIsFor === !side"
          :trail="newTrail"
          :key="point.id"
          is-link
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import DwdTrail from '@/components/DwdTrail.vue';
import IconAdd from '@/components/IconAdd.vue';
import ItemBlock from '@/components/ItemBlock.vue';
import { ItemType } from '@/common/constants';
import {
  isItemAlive,
  parseTrail,
  rotateWithIndexes,
  titleFromText,
} from '@/utils';

export default {
  components: {
    DwdTrail,
    IconAdd,
    ItemBlock,
  },
  async asyncData({ store, route }) {
    const id = route.params.id;
    const claim = store.state.claims[id];
    if (!claim || claim.depth < 2) {
      const promise = store.dispatch('getItem', {
        type: ItemType.CLAIM,
        id,
        trail: parseTrail(route.query.trail),
      });
      if (!claim) {
        // Only block if there's nothing to display.
        await promise;
      }
    }
  },
  metaInfo() {
    if (!isItemAlive(this.claim)) {
      return {};
    }
    return {
      title: titleFromText(this.claim.text),
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.claim.text,
        },
      ],
    };
  },
  data: () => ({
    showComments: false,
    isFor: null,
  }),
  computed: {
    ...mapGetters('sort', ['combineAndSortPoints']),
    id() {
      return this.$route.params.id;
    },
    claim() {
      return this.lookupClaim(this.id);
    },
    claimIsFor() {
      return this.isFor !== null ? this.isFor : true;
    },
    points() {
      if (!this.claim || this.claim.deleted || this.claim.depth < 2) {
        return [];
      }
      return this.combineAndSortPoints(this.claim);
    },
    zippedPoints() {
      return rotateWithIndexes(this.points);
    },
    trail() {
      return parseTrail(this.$route.query.trail);
    },
    newTrail() {
      return this.trail.concat(this.id);
    },
    superItems() {
      if (!this.claim) {
        return [];
      }

      const superTopics = (this.claim.superTopicIds || []).map(id => [
        this.lookupTopic(id),
        ItemType.TOPIC,
      ]);
      const superClaims = (this.claim.superClaimIds || []).map(id => [
        this.lookupClaim(id),
        ItemType.CLAIM,
      ]);
      return superTopics.concat(superClaims);
    },
  },
  methods: {
    sideClass(side) {
      return this.claimIsFor === !side ? this.$style.for : this.$style.against;
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.pointHeader {
  display: flex;
  font-size: 1.25em;
  text-align: center;

  &:global(.block) > * {
    margin-top: 0;
  }
}

.for,
.against {
  flex: 1;
  align-items: center;

  span {
    flex: 1;
    align-items: center;
  }
}

.for {
  color: $purple-dark-primary;

  a {
    color: $purple-accent;

    &:hover {
      color: $purple-dark-primary;
    }
  }
}

.against {
  color: $amber-dark-primary;

  a {
    color: $amber-accent;

    &:hover {
      color: $amber-dark-primary;
    }
  }
}
</style>
