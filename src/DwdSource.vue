<template>
<div>
  <dwd-trail @lastIsFor="(v) => isFor = v"></dwd-trail>
  <div v-if="source" class="row gutter-16">
    <div class="col-sm-12">
      <div class="t1 bubble flex-row" :class="[bubbleColor]">
        <div class="content">
          <div>
            <div class="source-text">{{ source.text }}</div>
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
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import DwdComments from './DwdComments.vue';
import DwdLoader from './DwdLoader.vue';
import DwdTrail from './DwdTrail.vue';

export default {
  components: {
    DwdComments,
    DwdLoader,
    DwdTrail,
  },
  data: () => ({
    showComments: false,
    isFor: null,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    trail: function () {
      if (!this.$route.query.trail) {
        return [];
      }
      return this.$route.query.trail.split(',');
    },
    bubbleColor: function () {
      if (this.isFor === null) {
        return 'green';
      }
      return this.isFor ? 'purple' : 'amber';
    },
  },
  methods: {
    checkLoaded: function () {
      if (!this.source) {
        this.$store.dispatch('getSource', {
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
  watch: {
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
};
</script>
