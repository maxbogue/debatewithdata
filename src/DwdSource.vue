<template>
<div>
  <div v-if="source" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1 flex-row">
        <div class="content">
          <div>
            <div class="source-text">{{ source.text }}</div>
            <div v-if="ary" class="ary-text">{{ ary }}</div>
          </div>
          <a :href="source.url" class="source-url">{{ source.url }}</a>
        </div>
        <div class="controls">
          <router-link v-if="$store.state.user"
                       :to="sourceUrl(id) + '/edit'"
                       class="glyphicon glyphicon-pencil click"
                       aria-hidden="true"></router-link>
          <span class="glyphicon glyphicon-comment click"
                aria-hidden="true"
                @click="showComments = !showComments"></span>
        </div>
      </div>
      <dwd-comments v-if="showComments"
                    :url="'/api/source/' + id"></dwd-comments>
    </div>
  </div>
  <div v-else-if="!$store.state.loaded">Loading sources...</div>
  <div v-else>Source not found.</div>
</div>
</template>

<script>
import DwdComments from './DwdComments.vue';

export default {
  components: {
    DwdComments,
  },
  data: () => ({
    showComments: false,
  }),
  computed: {
    id: function () {
      return this.$route.params.sourceId;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    ary: function () {
      if (!this.source) {
        return '';
      }
      if (this.source.ary === 1) {
        return 'PRIMARY';
      } else if (this.source.ary === 2) {
        return 'SECONDARY';
      } else if (this.source.ary === 3) {
        return 'TERTIARY';
      }
      return '';
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
.ary-text {
  font-size: 12px;
}
</style>
