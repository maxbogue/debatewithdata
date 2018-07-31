<template>
<div :class="$style.editChart">
  <div>
    <span v-if="!chart" @click="addChart">Add Chart</span>
    <span v-else @click="removeChart">Remove Chart</span>
  </div>
  <template v-if="chart">
    <label for="chartType" class="hint">
      The type of chart.
    </label>
    <select v-model="type" id="chartType">
      <option value="line">Line</option>
      <option value="bar">Bar</option>
    </select>
    <label for="byRow"
           class="hint"
           >Should the data be combined by row or column?</label>
    <select v-model="by" id="byRow">
      <option value="">{{ defaultByRow ? 'Row' : 'Column' }} (default)</option>
      <option value="row">Row</option>
      <option value="col">Column</option>
    </select>
    <label for="title" class="hint">Chart title.</label>
    <dwd-input v-model="title"
               id="title"
               :placeholder="defaultTitle" />
    <label for="xAxis" class="hint">Label for the x-axis.</label>
    <dwd-input v-model="xAxis"
               id="xAxis"
               :placeholder="defaultXAxis" />
    <label for="yAxis" class="hint">Label for the y-axis.</label>
    <dwd-input v-model="yAxis"
               id="yAxis"
               :placeholder="defaultYAxis" />
    <source-chart v-if="chart"
                  :table="table"
                  :chart="chart" />
  </template>
</div>
</template>

<script>
import DwdInput from './DwdInput.vue';
import { deserializeTable } from '../common/utils';

const SourceChart = () =>
  import(/* webpackChunkName: "chart" */ './SourceChart.vue');

const UNIT_REGEX = /^(.+) \((.+)\)$/;

function extractText(s) {
  return UNIT_REGEX.test(s) ? s.match(UNIT_REGEX)[1] : s;
}

function extractUnit(s, defaultUnit = '') {
  return UNIT_REGEX.test(s) ? s.match(UNIT_REGEX)[2] : defaultUnit;
}

export default {
  components: {
    DwdInput,
    SourceChart,
  },
  props: {
    table: { type: String, required: true },
    chart: { type: Object, default: null },
  },
  data: () => ({
    type: 'line',
    title: '',
    xAxis: '',
    yAxis: '',
    by: '',
  }),
  computed: {
    tableData: function () {
      return deserializeTable(this.table);
    },
    defaultTitle: function () {
      if (this.tableData[0].length !== 1) {
        return 'chart title';
      }
      return extractText(this.tableData[0][0]);
    },
    defaultUnit: function () {
      if (this.tableData[0].length !== 1) {
        return '';
      }
      return extractUnit(this.tableData[0][0]);
    },
    rows: function () {
      if (this.tableData[0].length === 1) {
        return this.tableData.slice(1);
      }
      return this.tableData;
    },
    columnLabels: function () {
      return this.rows[0].slice(1).map(extractText);
    },
    rowLabels: function () {
      return this.rows.slice(1).map((row) => row[0]);
    },
    columnUnits: function () {
      return this.rows[0].slice(1).map(
        (s) => extractUnit(s, this.defaultUnit) || s);
    },
    uniqueUnits: function () {
      let units = new Set();
      return this.columnUnits.filter((unit) => {
        if (units.has(unit)) {
          return false;
        }
        units.add(unit);
        return true;
      });
    },
    defaultByRow: function () {
      return this.columnUnits.length > 1 && this.uniqueUnits.length === 1;
    },
    byRow: function () {
      return this.by ? this.by === 'row' : this.defaultByRow;
    },
    defaultXAxis: function () {
      return this.byRow ? '' : this.rows[0][0];
    },
    defaultYAxis: function () {
      return this.uniqueUnits[0];
    },
    newChart: function () {
      return {
        type: this.type,
        title: this.title,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        byRow: this.by ? this.byRow : null,
      };
    },
  },
  watch: {
    newChart: function () {
      this.$emit('update:chart', this.newChart);
    },
  },
  mounted: function () {
    if (this.chart) {
      this.type = this.chart.type || 'line';
      this.title = this.chart.title || '';
      this.xAxis = this.chart.xAxis || '';
      this.yAxis = this.chart.yAxis || '';
      if (typeof this.chart.byRow === 'boolean') {
        this.by = this.chart.byRow ? 'row' : 'col';
      }
    }
  },
  methods: {
    addChart: function () {
      this.$emit('update:chart', this.newChart);
    },
    removeChart: function () {
      this.$emit('update:chart', null);
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.editChart {
  span {
    font-size: 0.75em;
    font-weight: $font-weight-bold;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  :not(:first-child) {
    margin-top: 8px;
  }
}
</style>
