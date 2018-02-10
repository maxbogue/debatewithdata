<template>
<div class="bubble">
  <label for="url" class="hint">
    Link a source that provides data about the world.
  </label>
  <dwd-input v-model="url"
             id="url"
             placeholder="url"
             :focus="true"
             :validate="validate.url" />
  <label for="text" class="hint">
    Describe the data the link provides.
  </label>
  <dwd-input v-model="text"
             id="text"
             placeholder="description"
             :validate="validate.text" />
  <label for="date" class="hint">
    Date the source.
  </label>
  <dwd-input v-model="date"
             id="date"
             placeholder="YYYY-MM-DD"
             mono
             :validate="validate.date" />
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
    <dwd-input v-model="institution"
               id="institution"
               placeholder="College, government agency, etc."
               :validate="validate.institution" />
  </template>
  <template v-if="type === 'research' || type === 'article'">
    <label for="publication" class="hint">
      Where was the {{ type }} published?
    </label>
    <dwd-input v-model="publication"
               id="publication"
               placeholder="Scientific journal, newspaper, etc."
               :validate="validate.publication" />
  </template>
</div>
</template>

<script>
import DwdInput from './DwdInput.vue';
import { validateSource } from '../common/validate';

export default {
  components: {
    DwdInput,
  },
  props: {
    source: Object,
  },
  data: () => ({
    text: '',
    url: '',
    date: '',
    type: 'misc',
    institution: '',
    publication: '',
    firstHand: false,
    validate: validateSource,
  }),
  computed: {
    newSource: function () {
      let source = {
        url: this.url,
        text: this.text,
        type: this.type,
      };
      if (this.date) {
        source.date = this.date;
      }
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
        this.text = this.source.text || '';
        this.date = this.source.date || '';
        this.type = this.source.type || 'misc';
        this.institution = this.source.institution || '';
        this.publication = this.source.publication || '';
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
