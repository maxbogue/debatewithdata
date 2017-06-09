<template>
<div>
  <template v-if="!adding">
    <router-link v-for="(source, id) in sources"
                 class="source"
                 :to="'/source/' + id"
                 :key="id">
      <div class="text">{{ source.text }}</div>
      <div class="url">{{ source.url }}</div>
    </router-link>
    <div class="center">
      <span class="add click" @click="adding = true">+</span>
    </div>
  </template>
  <template v-else>
    <dwd-edit-source @commit="addSource" @cancel="adding = false" />
    <div v-if="error">{{ error }}</div>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex';

import DwdEditSource from './DwdEditSource.vue';

export default {
  components: {
    DwdEditSource,
  },
  data: () => ({
    adding: false,
    error: '',
  }),
  computed: mapState([
    'sources',
  ]),
  methods: {
    addSource: function (source) {
      this.$store.dispatch('addSource', { source }).then(() => {
        this.adding = false;
      }).catch((error) => {
        this.error = error;
      });
    },
  },
};
</script>

<style>
a.source {
  color: #000;
  display: block;
}
a.source:hover {
  background-color: #E0E0E0;
  text-decoration: none;
}
.add {
  font-size: 32px;
}
.source > .text {
  font-size: 16px;
  font-weight: 600;
}
.source > .url {
  color: #666;
  font-size: 12px;
}
</style>
