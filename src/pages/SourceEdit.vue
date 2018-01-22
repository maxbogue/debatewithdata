<template>
<div>
  <form v-if="!needsData" @submit.prevent="commit">
    <source-edit-content :source="source" @update="(s) => newSource = s" />
    <div class="block no-pad center">
      <button type="submit" class="dwd-btn green-dark">Submit</button>
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
import SourceEditContent from '../SourceEditContent.vue';

export default {
  components: {
    DeleteButton,
    DwdLoader,
    SourceEditContent,
  },
  data: () => ({
    newSource: null,
  }),
  computed: {
    id: function () {
      return this.$route.params.id;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    needsData: function () {
      return this.id && !this.source;
    },
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
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getSource', {
          id: this.id,
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
