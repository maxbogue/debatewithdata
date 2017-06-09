<template>
<div>
  <template v-if="!editing">
    <div class="row gutter-16">
      <div class="col-sm-12">
        <div class="source">
          <span class="glyphicon glyphicon-pencil edit click" @click="editing = !editing" aria-hidden="true"></span>
          <div class="text">{{ source.text }}</div>
          <div class="url">{{ source.url }}</div>
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
.source {
  background-color: #EEEEEE;
  border: 1px solid #757575;
  margin-top: 8px;
  padding: 15px;
}
.edit {
  float: right;
  margin-left: 5px;
}
.click:hover {
  color: #aaa;
  cursor: pointer;
}
.gutter-16.row {
  margin-right: -8px;
  margin-left: -8px;
}
.gutter-16 > [class^="col-"], .gutter-16 > [class^=" col-"] {
  padding: 8px;
}
</style>
