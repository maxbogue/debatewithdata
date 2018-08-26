<template>
<div class="block no-pad center">
  <h3 class="mono">{{ curr.revId }}</h3>
  <div>
    <strong>by</strong>
    <router-link :to="'/user/' + curr.username"
                 >{{ curr.username }}</router-link>
  </div>
  <div><strong>created</strong> {{ curr.createdAt | timestamp }}</div>
  <div :class="$style.nav">
    <router-link :to="prevUrl"
                 :class="[buttonClasses, { [$style.hidden]: !prevUrl }]"
                 >Prev</router-link>
    <router-link :to="historyUrl"
                 :class="buttonClasses">History</router-link>
    <router-link :to="nextUrl"
                 :class="[buttonClasses, { [$style.hidden]: !nextUrl }]"
                 >Next</router-link>
  </div>
  <div>
    <router-link v-if="revertTo"
                 :to="revertTo"
                 class="click-text">Revert To This Revision</router-link>
  </div>
</div>
</template>

<script>
import { ItemType } from '@/common/constants';

export default {
  props: {
    itemType: { type: String, required: true },
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
    next: { type: Object, default: null },
    trail: { type: Array, required: true },
  },
  computed: {
    url() {
      return this.itemUrl(this.itemType, this.curr.id, this.trail);
    },
    prevUrl() {
      if (!this.prev) {
        return '';
      }
      return this.appendToUrl(this.url, '/rev/' + this.prev.revId);
    },
    nextUrl() {
      if (!this.next) {
        return '';
      }
      return this.appendToUrl(this.url, '/rev/' + this.next.revId);
    },
    historyUrl() {
      return this.appendToUrl(this.url, '/history');
    },
    revertTo() {
      if (!this.next || this.curr.deleted) {
        // Can't revert if already HEAD or is a deletion.
        return null;
      }
      return {
        name: this.itemType + 'Edit',
        params: { id: this.curr.id, seed: this.curr },
      };
    },
    buttonClasses() {
      let colorClass = 'grey';
      if (this.itemType === ItemType.CLAIM) {
        colorClass = 'blue-dark';
      } else if (this.itemType === ItemType.TOPIC) {
        colorClass = 'pink-dark';
      } else if (this.itemType === ItemType.SOURCE) {
        colorClass = 'green-dark';
      }
      return ['dwd-btn', colorClass];
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.hidden {
  visibility: hidden;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    width: 7em;
  }
}
</style>
