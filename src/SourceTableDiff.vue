<template>
<source-table v-if="curr && prev && curr === prev" :table="curr" />
<table v-else-if="curr && prev" :class="$style.table">
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
    diffRows: function () {
      if (!this.curr || !this.prev) {
        return [];
      }
      let prevRows = deserializeTable(this.prev);
      let currRows = deserializeTable(this.curr);
      let numRows = Math.max(prevRows.length, currRows.length);
      let numCols = Math.max(prevRows[0].length, currRows[0].length);
      let diffs = [];
      for (let i = 0; i < numRows; i += 1) {
        let prevRow = prevRows[i];
        let currRow = currRows[i];
        let newRow = [];
        for (let j = 0; j < numCols; j += 1) {
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
