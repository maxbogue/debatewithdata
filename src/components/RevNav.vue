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
                 :class="{ [$style.hidden]: !prevUrl }"
                 class="dwd-btn grey">Prev</router-link>
    <router-link :to="historyUrl"
                 class="dwd-btn grey">History</router-link>
    <router-link :to="nextUrl"
                 :class="{ [$style.hidden]: !nextUrl }"
                 class="dwd-btn grey">Next</router-link>
  </div>
  <div>
    <router-link v-if="revertTo"
                 :to="revertTo">Revert To This Revision</router-link>
  </div>
</div>
</template>

<script>
export default {
  props: {
    itemType: { type: String, required: true },
    curr: { type: Object, required: true },
    prev: { type: Object, default: null },
    next: { type: Object, default: null },
    trail: { type: Array, required: true },
  },
  computed: {
    url: function () {
      return this.itemUrl(this.itemType, this.curr.id, this.trail);
    },
    prevUrl: function () {
      if (!this.prev) {
        return '';
      }
      return this.appendToUrl(this.url, '/rev/' + this.prev.revId);
    },
    nextUrl: function () {
      if (!this.next) {
        return '';
      }
      return this.appendToUrl(this.url, '/rev/' + this.next.revId);
    },
    historyUrl: function () {
      return this.appendToUrl(this.url, '/history');
    },
    revertTo: function () {
      if (!this.next || this.curr.deleted) {
        // Can't revert if already HEAD or is a deletion.
        return null;
      }
      return {
        name: this.itemType + 'Edit',
        params: { id: this.curr.id, seed: this.curr },
      };
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

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
