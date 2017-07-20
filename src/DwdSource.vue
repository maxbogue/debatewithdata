<template>
<div>
  <div v-if="source" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1">
        <router-link :to="sourceUrl(id) + '/edit'" class="glyphicon glyphicon-pencil edit click" aria-hidden="true"></router-link>
        <div class="source-text">{{ source.text }}</div>
        <a :href="source.url" class="source-url">{{ source.url }}</a>
      </div>
    </div>
  </div>
  <div v-else-if="!$store.state.loaded">Loading sources...</div>
  <div v-else>Source not found.</div>
</div>
</template>

<script>

export default {
  computed: {
    id: function () {
      return this.$route.params.sourceId;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
  },
  methods: {
    updateSource: function (source) {
      this.$store.dispatch('updateSource', {
        id: this.id,
        source,
      }).then(() => {
        this.editing = false;
        this.error = '';
      }).catch((error) => {
        this.error = error;
      });
    },
  },
};
</script>
