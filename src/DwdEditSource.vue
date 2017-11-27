<template>
<div>
  <form v-if="!needsData" class="row gutter-16" @submit.prevent="commit">
    <div class="col-sm-12">
      <div class="source neutral">
        <div class="bubble">
          <label for="url" class="hint">
            Link a source that provides data about the world.
          </label>
          <textarea id="url"
                    rows="1"
                    required
                    autocomplete="off"
                    placeholder="url"
                    ref="url"
                    :class="{invalid: !validUrl}"
                    v-model="url"
                    v-auto-resize></textarea>
          <label for="text" class="hint">
            Describe the data the link provides.
          </label>
          <textarea id="text"
                    rows="1"
                    required
                    autocomplete="off"
                    placeholder="description"
                    v-model="text"
                    v-auto-resize></textarea>
          <label class="hint">Classify the type of source.</label>
          <div>
            <div :class="typeClass('misc')"
                 @click="type = 'misc'">
              <h2>Miscellaneous</h2>
              <div>A source that does not fall under any other category.</div>
            </div>
            <div :class="typeClass('research')"
                 @click="type = 'research'">
              <h2>Research</h2>
              <div>Scientific research published by an institution.</div>
            </div>
            <div :class="typeClass('article')"
                 @click="type = 'article'">
              <h2>Article</h2>
              <div>A news article reporting on something that happened.</div>
            </div>
            <div :class="typeClass('authority')"
                 @click="type = 'authority'">
              <h2>Authority</h2>
              <div>An authoritative source for the data.</div>
            </div>
          </div>
          <template v-if="type === 'research' || type === 'authority'">
            <label for="institution" class="hint">
              What institution produced the data?
            </label>
            <textarea id="institution"
                      rows="1"
                      required
                      autocomplete="off"
                      placeholder="College, government agency, etc."
                      v-model="institution"></textarea>
          </template>
          <template v-if="type === 'research' || type === 'article'">
            <label for="publication" class="hint">
              Where was the {{ type }} published?
            </label>
            <textarea id="publication"
                      rows="1"
                      required
                      autocomplete="off"
                      placeholder="Scientific journal, newspaper, etc."
                      v-model="publication"></textarea>
          </template>
          <template v-if="type === 'article'">
            <label for="firstHand" class="hint">
              Is the article a first-hand account of an event?
            </label>
            <input type="checkbox" id="firstHand" v-model="firstHand"></input>
          </template>
        </div>
      </div>
    </div>
    <div class="col-sm-12 center">
      <button type="submit" class="btn btn-primary">Submit</button>
      <button type="button"
              class="btn btn-default"
              @click="cancel">Cancel</button>
    </div>
    <div v-if="id" class="col-xs-12 center">
      <delete-button noun="Source" @delete="remove"></delete-button>
    </div>
  </form>
  <dwd-loader ref="loader"></dwd-loader>
</div>
</template>

<script>
import { isWebUri } from 'valid-url';

import DeleteButton from './DeleteButton.vue';
import DwdLoader from './DwdLoader.vue';

const ERROR_MSG_INVALID_URL = 'Please enter a URL.';

export default {
  components: {
    DeleteButton,
    DwdLoader,
  },
  data: () => ({
    text: '',
    url: '',
    type: 'misc',
    institution: '',
    publication: '',
    firstHand: false,
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
    validUrl: function () {
      return isWebUri(this.url);
    },
  },
  methods: {
    typeClass: function (type) {
      return {
        [this.$style.type]: true,
        [this.$style.selected]: type === this.type,
      };
    },
    commit: function () {
      let action = 'addSource';
      let source = {
        url: this.url,
        text: this.text,
        type: this.type,
      };
      switch (this.type) {
      case 'research':
        source.institution = this.institution;
        source.publication = this.publication;
        break;
      case 'article':
        source.publication = this.publication;
        source.firstHand = this.firstHand;
        break;
      case 'authority':
        source.institution = this.institution;
        break;
      }
      let payload = { source };
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
      this.url = this.source.url;
      this.text = this.source.text;
      this.type = this.source.type;
      this.institution = this.source.institution;
      this.publication = this.source.publication;
      this.firstHand = this.source.firstHand;
    },
    checkLoaded: function () {
      if (this.needsData) {
        this.$store.dispatch('getSource', {
          id: this.id,
          loader: this.$refs.loader,
        }).then(() => {
          this.initialize();
        });
      } else if (this.id) {
        // Adding a new source.
        this.initialize();
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
    id: function () {
      this.checkLoaded();
    },
  },
  mounted: function () {
    this.checkLoaded();
  },
};
</script>

<style lang="sass" module>
@import "style/constants"

.type
  background-color: $background-light
  border: 1px solid $text-light-accent
  border-radius: 3px
  font-size: 10px
  margin-top: 4px
  padding: 4px
  text-align: center
  width: 300px

  h2
    font-size: 16px
    margin: 0

.type:hover
  background-color: $background-light-accent
  cursor: pointer

.type.selected
  background-color: $green-dark-primary
  border-color: $green-dark-accent
  color: $text-light
</style>
