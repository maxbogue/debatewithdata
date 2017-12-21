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
          <span class="id mono">{{ source.id }}</span>
          <router-link v-if="$store.state.user"
                        :to="sourceUrl(id) + '/edit'"
                        class="glyphicon glyphicon-pencil click"
                        aria-hidden="true"></router-link>
          <comment-icon @click.native="showComments = !showComments"
                        :count="source.commentCount" />
        </div>
        <dwd-comments v-if="showComments"
                      :url="'/api/source/' + id" />
      </drawer>
    </div>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import CommentIcon from '../CommentIcon.vue';
import Drawer from '../Drawer.vue';
import DwdComments from '../DwdComments.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import SourceContent from '../SourceContent.vue';

export default {
  components: {
    CommentIcon,
    Drawer,
    DwdComments,
    DwdLoader,
    DwdTrail,
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
