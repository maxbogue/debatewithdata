<template>
<div>
  <dwd-trail @lastIsFor="(v) => isFor = v" />
  <template v-if="source">
    <div class="source" :class="isFor | toSideString">
      <source-content class="bubble click"
                      @click.native="showDrawer = !showDrawer"
                      :source="source" />
      <dwd-drawer :show="showDrawer">
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
      </dwd-drawer>
    </div>
    <h3 v-if="claims.length > 0">Referenced In</h3>
    <router-link v-for="claim in claims"
                 class="claim block"
                 :to="claimUrl(claim.id)"
                 :key="claim.id">
        <claim-content :claim="claim" />
    </router-link>
  </template>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import map from 'lodash/map';

import ClaimContent from '../ClaimContent.vue';
import DwdComments from '../DwdComments.vue';
import DwdDrawer from '../DwdDrawer.vue';
import DwdLoader from '../DwdLoader.vue';
import DwdTrail from '../DwdTrail.vue';
import IconComment from '../IconComment.vue';
import IconEdit from '../IconEdit.vue';
import IconHistory from '../IconHistory.vue';
import SourceContent from '../SourceContent.vue';

export default {
  components: {
    ClaimContent,
    DwdComments,
    DwdDrawer,
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
    claims: function () {
      if (!this.source || !this.source.claimIds) {
        return [];
      }
      return map(this.source.claimIds, this.lookupClaim);
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
  methods: {
    checkLoaded: function () {
      if (!this.source || !this.source.claimIds) {
        this.$store.dispatch('getSource', {
          id: this.id,
          trail: this.trail,
          loader: this.$refs.loader,
        });
      }
    },
  },
};
</script>
