<template>
<div>
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
    Optionally date the source.
  </label>
  <dwd-input v-model="date"
             id="date"
             placeholder="YYYY-MM-DD"
             mono
             :validate="validate.date.emptyAsNull" />
  <label class="hint">Classify the type of source.</label>
  <div :class="$style.type">
    <select v-model="type">
      <option value="misc">Miscellaneous</option>
      <option value="research">Research</option>
      <option value="article">Article</option>
      <option value="authority">Authority</option>
    </select>
    <div v-if="type === 'misc'"
         >A source that does not fall under any other category.</div>
    <div v-if="type === 'research'"
         >Scientific research published by an institution.</div>
    <div v-if="type === 'article'"
         >A news article reporting on something that happened.</div>
    <div v-if="type === 'authority'"
         >An authoritative source for the data.</div>
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
  <label for="table" class="hint">
    Tabular data.
  </label>
  <source-edit-table :table.sync="table" />
</div>
</template>

<script>
import DwdInput from './DwdInput.vue';
import SourceEditTable from './SourceEditTable.vue';
import { validateSource } from '../common/validate';

export default {
  components: {
    DwdInput,
    SourceEditTable,
  },
  props: {
    source: { type: Object, default: null },
  },
  data: () => ({
    text: '',
    url: '',
    date: '',
    type: 'misc',
    institution: '',
    publication: '',
    firstHand: false,
    table: null,
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
      if (this.table) {
        source.table = this.table;
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
  watch: {
    source: function () {
      this.initialize();
    },
    newSource: function () {
      this.$emit('update:source', this.newSource);
    },
  },
  mounted: function () {
    this.initialize();
  },
  methods: {
    initialize: function () {
      if (this.source) {
        this.url = this.source.url;
        this.text = this.source.text || '';
        this.date = this.source.date || '';
        this.table = this.source.table;
        this.type = this.source.type || 'misc';
        this.institution = this.source.institution || '';
        this.publication = this.source.publication || '';
        this.firstHand = this.source.firstHand;
      }
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.type {
  display: flex;
  align-items: center;

  select {
    margin-right: 8px;
    font-weight: inherit;
  }

  div {
    font-size: 0.8em;
  }
}
</style>
