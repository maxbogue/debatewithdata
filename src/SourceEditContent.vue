<template>
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
</template>

<script>
import { isWebUri } from 'valid-url';

const ERROR_MSG_INVALID_URL = 'Please enter a URL.';

export default {
  props: {
    source: Object,
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
    validUrl: function () {
      return isWebUri(this.url);
    },
    newSource: function () {
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
      return source;
    },
  },
  methods: {
    typeClass: function (type) {
      return {
        [this.$style.type]: true,
        [this.$style.selected]: type === this.type,
      };
    },
    initialize: function () {
      if (this.source) {
        this.url = this.source.url;
        this.text = this.source.text;
        this.type = this.source.type;
        this.institution = this.source.institution;
        this.publication = this.source.publication;
        this.firstHand = this.source.firstHand;
      }
    },
  },
  watch: {
    source: function () {
      this.initialize();
    },
    newSource: function () {
      this.$emit('update', this.newSource);
    },
    url: function () {
      if (this.validUrl) {
        this.$refs.url.setCustomValidity('');
      } else {
        this.$refs.url.setCustomValidity(ERROR_MSG_INVALID_URL);
      }
    },
  },
  mounted: function () {
    this.initialize();
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
