<template>
<div>
  <router-link v-for="(source, id) in sources"
               class="t1"
               :to="sourceUrl(id)"
               :key="id">
    <div class="source-text">{{ source.text }}</div>
    <div class="source-url">{{ source.url }}</div>
  </router-link>
  <div class="center" v-if="$store.state.user">
    <router-link to="/sources/add" class="add click">+</router-link>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState([
    'sources',
  ]),
};
</script>

<style>
.add {
  font-size: 32px;
}
</style>
