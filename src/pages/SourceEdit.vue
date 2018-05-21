<template>
<div>
  <form-valid v-if="!needsData"
              @submit="review"
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
  <dwd-loader ref="loader" />
</div>
</template>

<script>
import clone from 'lodash/clone';

import DeleteButton from '../DeleteButton.vue';
import DwdLoader from '../DwdLoader.vue';
import FormValid from '../FormValid.vue';
import SourceEditContent from '../SourceEditContent.vue';
import SourceRevContent from '../SourceRevContent.vue';
import { authRedirect } from '../utils';
import { sourcesAreEqual } from '../../common/equality';

const BEFORE_UNLOAD_MESSAGE = 'Discard changes?';

function confirmLeave(to, from, next) {
  /* eslint no-invalid-this: "off" */
  if (!this.noChange && !window.confirm(BEFORE_UNLOAD_MESSAGE)) {
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
    DwdLoader,
    FormValid,
    SourceEditContent,
    SourceRevContent,
  },
  props: {
    id: { type: String, default: '' },
    seed: { type: Object, default: null },
  },
  data: () => ({
    showEditBlock: false,
    oldSource: null,
    newSource: null,
  }),
  computed: {
    source: function () {
      return this.lookupSource(this.id);
    },
    needsData: function () {
      return this.id && !this.source;
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
      this.checkLoaded();
    },
    showEditBlock: function () {
      if (this.showEditBlock) {
        this.oldSource = clone(this.newSource);
      }
    },
  },
  mounted: function () {
    this.checkLoaded();
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  beforeDestroy: function () {
    window.removeEventListener('beforeunload', this.beforeUnload);
  },
  methods: {
    beforeUnload: function (e) {
      if (this.noChange) {
        // Indicates not to warn.
        return undefined;
      }
      (e || window.event).returnValue = BEFORE_UNLOAD_MESSAGE;
      return BEFORE_UNLOAD_MESSAGE;
    },
    review: function () {
      this.showEditBlock = false;
    },
    submit: function () {
      let action = 'addSource';
      let payload = { source: this.newSource };
      if (this.id) {
        action = 'updateSource';
        payload.id = this.id;
        payload.source.baseRev = this.source.revId;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.$router.push(this.sourceUrl(id, this.trail));
      });
    },
    revert: function () {
      this.newSource = this.oldSource;
      this.showEditBlock = false;
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
        this.showEditBlock = true;
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
