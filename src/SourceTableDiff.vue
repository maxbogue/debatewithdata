<template>
<source-table v-if="curr && prev && curr === prev" :table="curr" />
<table v-else-if="curr && prev" :class="$style.table">
  <tr v-if="diffTitle">
    <th :colspan="numCols" v-html="diffTitle"></th>
  </tr>
  <tr>
    <th v-for="(headerDiff, i) in diffRows[0]"
        :key="'header' + i"
        v-html="headerDiff"></th>
  </tr>
  <tr v-for="(diffRow, i) in diffRows.slice(1)" :key="'row' + i">
    <td v-for="(diff, j) in diffRow"
        :key="i + ',' + j"
        v-html="diff"></td>
  </tr>
</table>
<source-table v-else-if="prev" :table="prev" class="del" />
<source-table v-else-if="curr" :table="curr" class="ins" />
</template>

<script>
import SourceTable from './SourceTable.vue';
import { deserializeTable } from '../common/utils';
import { diff } from './utils';

export default {
  components: {
    SourceTable,
  },
  props: {
    curr: { type: String, default: '' },
    prev: { type: String, default: '' },
  },
  computed: {
    prevTable: function () {
      if (!this.prev) {
        return [];
      }
      return deserializeTable(this.prev);
    },
    currTable: function () {
      if (!this.curr) {
        return [];
      }
      return deserializeTable(this.curr);
    },
    prevTitle: function () {
      if (this.prevTable[0].length !== 1) {
        return '';
      }
      return this.prevTable[0][0];
    },
    currTitle: function () {
      if (this.currTable[0].length !== 1) {
        return '';
      }
      return this.currTable[0][0];
    },
    diffTitle: function () {
      return diff(this.prevTitle, this.currTitle);
    },
    prevRows: function () {
      return this.prevTitle ? this.prevTable.slice(1) : this.prevTable;
    },
    currRows: function () {
      return this.currTitle ? this.currTable.slice(1) : this.currTable;
    },
    numRows: function () {
      return Math.max(this.prevRows.length, this.currRows.length);
    },
    numCols: function () {
      return Math.max(this.prevRows[0].length, this.currRows[0].length);
    },
    diffRows: function () {
      let diffs = [];
      for (let i = 0; i < this.numRows; i += 1) {
        let prevRow = this.prevRows[i];
        let currRow = this.currRows[i];
        let newRow = [];
        for (let j = 0; j < this.numCols; j += 1) {
          let prevCell = prevRow && prevRow[j] || '';
          let currCell = currRow && currRow[j] || '';
          newRow.push(diff(prevCell, currCell));
        }
        diffs.push(newRow);
      }
      return diffs;
    },
  },
};
</script>

<style lang="scss" module>
.table {
  border-collapse: collapse;
  font-size: 0.7em;

  th,
  td {
    min-width: 50px;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    line-height: 1;
  }
}
</style>
