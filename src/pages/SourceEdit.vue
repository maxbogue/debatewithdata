<template>
<div>
  <form v-if="!needsData" @submit.prevent="commit">
    <source-edit-block v-if="showEdit"
                       :source.sync="newSource"
                       @close="showEdit = false" />
    <div v-else class="source neutral">
      <source-rev-content class="bubble click"
                          :prev="source"
                          :curr="newSource"
                          @click.native="showEdit = true" />
    </div>
    <div class="block no-pad center">
      <button :disabled="showEdit"
              type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
      <button :disabled="showEdit"
              type="submit"
              class="dwd-btn green-dark">Submit</button>
    </div>
    <div v-if="id" class="block no-pad center">
      <delete-button noun="Source" @delete="remove" />
    </div>
  </form>
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import SourceEditBlock from '../SourceEditBlock.vue';
import SourceRevContent from '../SourceRevContent.vue';
import { authRedirect } from '../utils';

export default {
  beforeRouteEnter: authRedirect,
  components: {
    DeleteButton,
    DwdLoader,
    SourceEditBlock,
    SourceRevContent,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    showEdit: false,
    newSource: null,
  }),
  computed: {
    source: function () {
      return this.lookupSource(this.id);
    },
    needsData: function () {
      return this.id && !this.source;
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
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
    commit: function () {
      let action = 'addSource';
      let payload = { source: this.newSource };
      if (this.id) {
        action = 'updateSource';
        payload.id = this.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.sourceUrl(id, this.trail));
      });
    },
    remove: function (message) {
      this.$store.dispatch('removeSource', {
        id: this.id,
        message,
      }).then(() => {
        this.$router.push('/datas');
      });
    },
    cancel: function () {
      let url = this.id ? this.sourceUrl(this.id, this.trail) : '/datas';
      this.$router.push(url);
    },
    initialize: function () {
      let seed = this.seed || this.source;
      if (seed && !seed.deleted) {
        this.newSource = seed;
      }
      if (!this.seed) {
        this.showEdit = true;
      }
    },
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getSource', {
          id: this.id,
          loader: this.$refs.loader,
        }).then(() => {
          this.initialize();
        });
      } else {
        this.initialize();
      }
    },
  },
};
</script>
