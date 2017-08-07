<template>
<div>
  <router-link :to="addUrl" class="add click">+</router-link>
  <router-link v-for="(source, id) in sources"
               class="t1"
               :to="sourceUrl(id)"
               :key="id">
    <div class="source-text">{{ source.text }}</div>
    <div class="source-url">{{ source.url }}</div>
  </router-link>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState([
      'user',
      'sources',
    ]),
    addUrl: function () {
      if (this.user) {
        return '/sources/add';
      }
      return '/login?next=/sources/add';
    },
  },
};
</script>
