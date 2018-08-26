<template>
<div>
  <label for="url" class="hint">
    Link a source that provides data about the world.
    <span v-if="force"
          class="click-text"
          @click="$emit('update:force', false)">Convert to claim.</span>
  </label>
  <dwd-input v-model="url"
             id="url"
             placeholder="url"
             :focus="true"
             :validate="validate.url" />
  <label for="text" class="hint">
    Describe the data the source provides.
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
  <label for="type" class="hint">Classify the type of source.</label>
  <div :class="$style.type">
    <select v-model="type" id="type">
      <option value="misc">Miscellaneous</option>
      <option value="research">Research</option>
      <option value="article">Article</option>
      <option value="authority">Authority</option>
    </select>
    <div v-if="type === SourceType.MISC"
         >A source that does not fall under any other category.</div>
    <div v-if="type === SourceType.RESEARCH"
         >Scientific research published by an institution.</div>
    <div v-if="type === SourceType.ARTICLE"
         >A news article reporting on something that happened.</div>
    <div v-if="type === SourceType.AUTHORITY"
         >An authoritative source for the data.</div>
  </div>
  <template v-if="type === SourceType.RESEARCH
                  || type === SourceType.AUTHORITY">
    <label for="institution" class="hint">
      What institution produced the data?
    </label>
    <dwd-input v-model="institution"
               id="institution"
               placeholder="College, government agency, etc."
               :validate="validate.institution" />
  </template>
  <template v-if="type === SourceType.RESEARCH || type === SourceType.ARTICLE">
    <label for="publication" class="hint">
      Where was the {{ type }} published?
    </label>
    <dwd-input v-model="publication"
               id="publication"
               placeholder="Scientific journal, newspaper, etc."
               :validate="validate.publication" />
  </template>
  <label for="table" class="hint">Manage tabular data.</label>
  <source-edit-table :table.sync="table" />
  <source-edit-chart v-if="table"
                     :table="table"
                     :chart.sync="chart" />
</div>
</template>

<script>
import DwdInput from './DwdInput.vue';
import SourceEditChart from './SourceEditChart.vue';
import SourceEditTable from './SourceEditTable.vue';
import { SourceType } from '@/common/constants';
import { validateSource } from '@/common/validate';

export default {
  components: {
    DwdInput,
    SourceEditChart,
    SourceEditTable,
  },
  props: {
    source: { type: Object, default: null },
    // Indicates whether this component was forced to show and should display a
    // way to escape back to claim editing.
    force: { type: Boolean, default: false },
  },
  data: () => ({
    SourceType,
    text: '',
    url: '',
    date: '',
    type: SourceType.MISC,
    institution: '',
    publication: '',
    firstHand: false,
    table: null,
    chart: null,
    validate: validateSource,
  }),
  computed: {
    newSource() {
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
      if (this.chart) {
        source.chart = this.chart;
      }

      switch (this.type) {
        case SourceType.RESEARCH:
          source.institution = this.institution;
          source.publication = this.publication;
          break;
        case SourceType.ARTICLE:
          source.publication = this.publication;
          source.firstHand = this.firstHand;
          break;
        case SourceType.AUTHORITY:
          source.institution = this.institution;
          break;
      }
      return source;
    },
  },
  watch: {
    source() {
      this.initialize();
    },
    newSource() {
      this.$emit('update:source', this.newSource);
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      if (this.source) {
        this.url = this.source.url || '';
        this.text = this.source.text || '';
        this.date = this.source.date || '';
        this.table = this.source.table;
        this.chart = this.source.chart;
        this.type = this.source.type || SourceType.MISC;
        this.institution = this.source.institution || '';
        this.publication = this.source.publication || '';
        this.firstHand = this.source.firstHand;
      }
    },
  },
};
</script>

<style lang="scss" module>
@import '../style/constants';

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
