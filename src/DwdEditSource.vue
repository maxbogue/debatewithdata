<template>
<div>
  <form class="row gutter-16" @submit.prevent="commit">
    <div class="col-sm-12">
      <div class="t1 bubble green content">
        <textarea rows="1"
                  required
                  autocomplete="off"
                  placeholder="description"
                  v-model="text"></textarea>
        <textarea rows="1"
                  required
                  autocomplete="off"
                  placeholder="url"
                  ref="url"
                  v-model="url"
                  :class="{invalid: !validUrl}"></textarea>
        <div class="ary" :class="{selected: ary === 1}" @click="setAry(1)">
          <h2>Primary</h2>
          <div>Research paper, first reporting news article, authorative
            institution, etc.</div>
        </div>
        <div class="ary" :class="{selected: ary === 2}" @click="setAry(2)">
          <h2>Secondary</h2>
          <div>Article about a primary source (research, news broken by another
            institution, etc.)</div>
        </div>
        <div class="ary" :class="{selected: ary === 3}" @click="setAry(3)">
          <h2>Tertiary</h2>
          <div>Article about a secondary source (Wikipedia page with bad
            sources, etc.)</div>
        </div>
      </div>
    </div>
    <div v-if="error" class="col-xs-12 center">{{ error }}</div>
    <div class="col-sm-12 center">
      <button type="submit" class="btn btn-default">Submit</button>
      <button type="button"
              class="btn btn-default"
              @click="cancel">Cancel</button>
    </div>
    <div v-if="id" class="col-xs-12 center">
      <delete-button noun="Source" @delete="remove"></delete-button>
    </div>
  </form>
</div>
</template>

<script>
import { isWebUri } from 'valid-url';

import DeleteButton from './DeleteButton.vue';

const ERROR_MSG_INVALID_URL = 'Please enter a URL.';

export default {
  components: {
    DeleteButton,
  },
  data: () => ({
    error: '',
    initialized: false,
    text: '',
    url: '',
    ary: 0,
  }),
  computed: {
    id: function () {
      return this.$route.params.sourceId;
    },
    source: function () {
      return this.$store.state.sources[this.id] || null;
    },
    validUrl: function () {
      return isWebUri(this.url);
    },
  },
  methods: {
    setAry: function (ary) {
      if (this.ary === ary) {
        this.ary = 0;
      } else {
        this.ary = ary;
      }
    },
    commit: function () {
      let action = 'addSource';
      let payload = {
        source: {
          url: this.url,
          text: this.text,
          ary: this.ary,
        },
      };
      if (this.id) {
        action = 'updateSource';
        payload.id = this.id;
      }
      this.$store.dispatch(action, payload).then((id) => {
        this.error = '';
        this.$router.push(this.sourceUrl(id));
      }).catch((error) => {
        this.error = error;
      });
    },
    remove: function () {
      this.$store.dispatch('removeSource', {
        id: this.id,
      }).then(() => {
        this.$router.push('/sources');
      }).catch((error) => {
        this.error = error;
      });
    },
    cancel: function () {
      this.$router.push(this.id ? this.sourceUrl(this.id) : '/sources');
    },
    initialize: function () {
      if (this.source) {
        this.url = this.source.url;
        this.text = this.source.text;
        this.ary = this.source.ary;
      }
    },
  },
  watch: {
    url: function () {
      if (this.validUrl) {
        this.$refs.url.setCustomValidity('');
      } else {
        this.$refs.url.setCustomValidity(ERROR_MSG_INVALID_URL);
      }
    },
    source: function () {
      this.initialize();
    },
  },
  mounted: function() {
    this.initialize();
  },
};
</script>

<style>
.ary {
  background-color: #fff;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 10px;
  padding: 4px;
  text-align: center;
  width: 50%;
}
.ary:hover {
  background-color: #eee;
  cursor: pointer;
}
.ary h2 {
  font-size: 16px;
  margin: 0;
}
.ary.selected {
  background-color: #26A69A;
  border-color: #009688;
  color: #fff;
}
</style>
