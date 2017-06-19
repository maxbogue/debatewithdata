<template>
<div>
  <template v-if="!editing">
    <div class="row gutter-16">
      <div class="col-sm-12">
        <div class="t1">
          <span class="glyphicon glyphicon-pencil edit click" @click="editing = true" aria-hidden="true"></span>
          <div class="source-text">{{ source.text }}</div>
          <a :href="source.url" class="source-url">{{ source.url }}</a>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <dwd-edit-source :source="source" @commit="updateSource" @cancel="editing = false" />
    <div v-if="error">{{ error }}</div>
  </template>
</div>
</template>

<script>
import DwdEditSource from './DwdEditSource.vue';

export default {
  components: {
    DwdEditSource,
  },
  data: () => ({
    editing: false,
    error: '',
  }),
  computed: {
    id: function () {
      return this.$route.params.sourceId;
    },
    source: function () {
      return this.$store.state.sources[this.id] || {};
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

<style>
.edit {
  float: right;
  margin-left: 5px;
}
</style>
