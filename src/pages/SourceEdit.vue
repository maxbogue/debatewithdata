<template>
<div>
  <form v-if="!needsData" @submit.prevent="commit">
    <div class="source neutral">
      <source-rev-content class="bubble click"
                          :prev="source"
                          :curr="newSource"
                          @click.native="showModal = true" />
      <div class="info">
        <span class="id mono">{{ id || 'new' }}</span>
      </div>
    </div>
    <source-edit-modal :show.sync="showModal"
                       :source.sync="newSource" />
    <div class="block no-pad center">
      <button type="submit"
              class="dwd-btn green-dark">Submit</button>
      <button type="button"
              class="dwd-btn white"
              @click="cancel">Cancel</button>
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
import SourceEditModal from '../SourceEditModal.vue';
import SourceRevContent from '../SourceRevContent.vue';

export default {
  components: {
    DeleteButton,
    DwdLoader,
    SourceEditModal,
    SourceRevContent,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    showModal: false,
    newSource: null,
  }),
  computed: {
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    needsData: function () {
      return this.id && !this.source;
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
        this.$router.push(this.sourceUrl(id));
      });
    },
    remove: function () {
      this.$store.dispatch('removeSource', {
        id: this.id,
      }).then(() => {
        this.$router.push('/sources');
      });
    },
    cancel: function () {
      this.$router.push(this.id ? this.sourceUrl(this.id) : '/sources');
    },
    initialize: function () {
      let seed = this.seed || this.source;
      if (seed && !seed.deleted) {
        this.newSource = seed;
      }
      if (!this.seed) {
        this.showModal = true;
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
