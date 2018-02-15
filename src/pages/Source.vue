<template>
<div>
  <dwd-trail @lastIsFor="(v) => isFor = v" />
  <template v-if="source">
    <div class="source" :class="isFor | toSideString">
      <source-content class="bubble click"
                      @click.native="showDrawer = !showDrawer"
                      :source="source" />
      <drawer :show="showDrawer">
        <div class="info">
          <span class="id mono">{{ id }}</span>
          <icon-history :url="sourceUrl(id)" />
          <icon-edit v-if="$store.state.user" :url="sourceUrl(id)" />
          <icon-comment @click.native="showComments = !showComments"
                        :count="source.commentCount" />
        </div>
        <dwd-comments :url="'/api/source/' + id"
                      :show="showComments"
                      :hint="showDrawer" />
      </drawer>
    </div>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import Drawer from '../Drawer.vue';
import DwdComments from '../DwdComments.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import IconComment from '../IconComment.vue';
import IconEdit from '../IconEdit.vue';
import IconHistory from '../IconHistory.vue';
import SourceContent from '../SourceContent.vue';

export default {
  components: {
    Drawer,
    DwdComments,
    DwdLoader,
    DwdTrail,
    IconComment,
    IconEdit,
    IconHistory,
    SourceContent,
  },
  data: () => ({
    showComments: false,
    showDrawer: false,
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
