<template>
<ul :class="$style.activity" class="mono">
  <li v-for="item in activity" :key="item.timestamp + item.id">
    <span>{{ item.timestamp | timestamp }}</span>
    <router-link v-if="!hideUsername"
                 :to="'/user/' + item.username"
                 :class="$style.bold"
                 >{{ item.username }}</router-link>
    <router-link
      v-if="item.revId"
      :to="itemUrl(item.type, item.id) + '/rev/' + item.revId"
      :class="{ [$style.bold]: hideUsername }"
      >{{ item.action }}</router-link>
    <span v-else
          :class="{ [$style.bold]: hideUsername }"
          >{{ item.action }}</span>
    <router-link :to="itemUrl(item.type, item.id)"
                 :class="{ [$style.bold]: !hideUsername }"
                 >{{ displayItemType(item.type) }} {{ item.id }}</router-link>
  </li>
  <li v-if="activity.length === 0">None yet.</li>
</ul>
</template>

<script>
export default {
  props: {
    activity: { type: Array, required: true },
    hideUsername: { type: Boolean, default: false },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

.activity {
  width: 100%;
  padding: 0;
  font-size: 0.75em;
  list-style: none;

  a:hover {
    text-decoration: underline;
  }

  .bold {
    font-weight: $font-weight-bold;
  }
}
</style>
