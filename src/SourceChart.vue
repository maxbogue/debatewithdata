<template>
<div :class="$style.chart">
  <canvas ref="chart" height="200"></canvas>
</div>
</template>

<script>
import Chart from 'chart.js/dist/Chart.js';

import { deserializeTable } from '../common/utils';

const COLORS = ['#e91e63', '#1e88e5', '#8e24aa', '#ffb300', '#43a047'];
const UNIT_REGEX = /^(.+) \((.+)\)$/;

function transpose(m) {
  let t = [];
  for (let j = 0; j < m[0].length; j += 1) {
    let r = [];
    for(let i = 0; i < m.length; i += 1) {
      r.push(m[i][j]);
    }
    t.push(r);
  }
  return t;
}

function extractText(s) {
  return UNIT_REGEX.test(s) ? s.match(UNIT_REGEX)[1] : s;
}

function extractUnit(s, defaultUnit = '') {
  return UNIT_REGEX.test(s) ? s.match(UNIT_REGEX)[2] : defaultUnit;
}

export default {
  props: {
    table: { type: String, required: true },
    chart: { type: Object, required: true },
  },
  computed: {
    tableData: function () {
      return deserializeTable(this.table);
    },
    title: function () {
      if (this.chart.title) {
        return this.chart.title;
      } else if (this.tableData[0].length !== 1) {
        return '';
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
    byRow: function () {
      if (this.chart.byRow !== null) {
        return this.chart.byRow;
      }
      return this.columnUnits.length > 1 && this.uniqueUnits.length === 1;
    },
    xLabels: function () {
      return this.byRow ? this.columnLabels : this.rowLabels;
    },
    setLabels: function () {
      return this.byRow ? this.rowLabels : this.columnLabels;
    },
    xAxis: function () {
      if (this.chart.xAxis) {
        return this.chart.xAxis;
      }
      return this.byRow ? '' : this.rows[0][0];
    },
    yAxes: function () {
      if (this.chart.yAxis) {
        return [this.chart.yAxis];
      }
      return this.uniqueUnits;
    },
    datas: function () {
      let datas = this.rows.slice(1).map((row) => row.slice(1));
      if (!this.byRow) {
        datas = transpose(datas);
      }
      return datas;
    },
    datasets: function () {
      return this.datas.map((data, i) => ({
        label: this.setLabels[i],
        backgroundColor: COLORS[i % COLORS.length],
        borderColor: COLORS[i % COLORS.length],
        data,
        fill: false,
      }));
    },
    chartOptions: function () {
      return {
        type: this.chart.type,
        animation: {
          duration: 0,
        },
        data: {
          labels: this.xLabels,
          datasets: this.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: Boolean(this.title),
            text: this.title,
          },
          legend: {
            display: this.setLabels.length > 1 && this.setLabels < 4,
          },
          tooltips: {
            mode: 'point',
            intersect: true,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: Boolean(this.xAxis),
                labelString: this.xAxis,
              }
            }],
            yAxes: this.yAxes.map((yAxis) => ({
              display: true,
              scaleLabel: {
                display: Boolean(yAxis),
                labelString: yAxis,
              }
            })),
          }
        },
      };
    },
  },
  watch: {
    chartOptions: function () {
      this.resetChart();
    },
  },
  mounted: function () {
    this.resetChart();
  },
  methods: {
    resetChart: function () {
      if (this.chartObj) {
        this.chartObj.destroy();
      }
      this.chartObj = new Chart(
          this.$refs.chart.getContext('2d'), this.chartOptions);
    },
  },
};
</script>

<style lang="scss" module >
.chart {
  position: relative;
  max-width: 600px;
  height: 300px;
}
</style>
