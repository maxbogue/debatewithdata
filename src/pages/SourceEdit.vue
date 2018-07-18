<template>
<form-valid @submit="review"
            @keydown.native.esc="revert">
  <div v-if="showEditBlock" class="source">
    <source-edit-content v-if="showEditBlock"
                         class="bubble"
                         :source.sync="newSource" />
  </div>
  <div v-else class="source neutral">
    <source-rev-content class="bubble click"
                        :prev="source"
                        :curr="newSource"
                        @click.native="showEditBlock = true" />
  </div>
  <div class="block no-pad center">
    <button type="button"
            class="dwd-btn white"
            @click="cancel">Cancel</button>
    <button v-if="showEditBlock"
            type="button"
            class="dwd-btn green-dark"
            @click="review">Review</button>
    <button v-else
            :disabled="noChange"
            type="button"
            class="dwd-btn green-dark"
            @click="submit">Submit</button>
  </div>
  <div v-if="id" class="block no-pad center">
    <delete-button noun="Source" @delete="remove" />
  </div>
</form-valid>
</template>

<script>
import clone from 'lodash/clone';

import DeleteButton from '../components/DeleteButton.vue';
import FormValid from '../components/FormValid.vue';
import SourceEditContent from '../components/SourceEditContent.vue';
import SourceRevContent from '../components/SourceRevContent.vue';
import { ItemType } from '../../common/constants';
import { authRedirect, parseTrail } from '../utils';
import { sourcesAreEqual } from '../../common/equality';

const BEFORE_UNLOAD_MESSAGE = 'Discard changes?';

function confirmLeave(to, from, next) {
  /* eslint no-invalid-this: "off" */
  if (this.unloadOverride || this.noChange) {
    next();
    return;
  }
  if (!window.confirm(BEFORE_UNLOAD_MESSAGE)) {
    next(false);
  } else {
    next();
  }
}

export default {
  beforeRouteEnter: authRedirect,
  beforeRouteUpdate: confirmLeave,
  beforeRouteLeave: confirmLeave,
  components: {
    DeleteButton,
    FormValid,
    SourceEditContent,
    SourceRevContent,
  },
  asyncData: async function ({ store, route }) {
    let id = route.params.id;
    let source = store.state.sources[id];
    if (id && !source) {
      await store.dispatch('getItem', {
        type: ItemType.SOURCE,
        id,
        trail: parseTrail(route.query.trail),
      });
    }
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    showEditBlock: false,
    oldSource: null,
    newSource: null,
    unloadOverride: false,
  }),
  computed: {
    source: function () {
      return this.lookupSource(this.id);
    },
    noChange: function () {
      return sourcesAreEqual(this.source, this.newSource);
    },
    trail: function () {
      return this.parseTrail(this.$route.query.trail);
    },
  },
  watch: {
    id: function () {
      this.initialize();
    },
    showEditBlock: function () {
      if (this.showEditBlock) {
        this.oldSource = clone(this.newSource);
      }
    },
  },
  mounted: function () {
    this.initialize();
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy: function () {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload: function (e) {
      if (this.unloadOverride || this.noChange) {
        // Indicates not to warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
    review: function () {
      this.showEditBlock = false;
    },
    submit: async function () {
      let action = 'addItem';
      let payload = {
        type: ItemType.SOURCE,
        item: this.newSource,
      };
      if (this.id) {
        action = 'updateItem';
        payload.item.id = this.id;
        payload.item.baseRev = this.source.revId;
      }
      let id = await this.$store.dispatch(action, payload);
      this.unloadOverride = true;
      this.$router.push(this.sourceUrl(id, this.trail));
    },
    revert: function () {
      this.newSource = this.oldSource;
      this.showEditBlock = false;
    },
    remove: async function (message) {
      await this.$store.dispatch('removeItem', {
        type: ItemType.SOURCE,
        id: this.id,
        message,
      });
      this.unloadOverride = true;
      this.$router.push('/datas');
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
        this.showEditBlock = true;
      }
    },
  },
};
</script>
