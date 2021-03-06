<template>
  <source-table v-if="curr && prev && curr === prev" :table="curr" />
  <table v-else-if="curr && prev" :class="$style.table">
    <tr v-if="diffTitle">
      <th :colspan="numCols" v-html="diffTitle"></th>
    </tr>
    <tr>
      <th
        v-for="(headerDiff, i) in diffRows[0]"
        :key="'header' + i"
        v-html="headerDiff"
      ></th>
    </tr>
    <tr v-for="(diffRow, i) in diffRows.slice(1)" :key="'row' + i">
      <td v-for="(diff, j) in diffRow" :key="i + ',' + j" v-html="diff"></td>
    </tr>
  </table>

  <source-table v-else-if="prev" :table="prev" class="del" />
  <source-table v-else-if="curr" :table="curr" class="ins" />
</template>

<script>
import { deserializeTable } from '@/common/utils';
import { diff } from '@/utils';

import SourceTable from './SourceTable.vue';

export default {
  components: {
    SourceTable,
  },
  props: {
    curr: { type: String, default: '' },
    prev: { type: String, default: '' },
  },
  computed: {
    prevTable() {
      if (!this.prev) {
        return [['']];
      }
      return deserializeTable(this.prev);
    },
    currTable() {
      if (!this.curr) {
        return [['']];
      }
      return deserializeTable(this.curr);
    },
    prevTitle() {
      return this.prevTable[0][0];
    },
    currTitle() {
      return this.currTable[0][0];
    },
    diffTitle() {
      return diff(this.prevTitle, this.currTitle);
    },
    prevRows() {
      return this.prevTable.slice(1);
    },
    currRows() {
      return this.currTable.slice(1);
    },
    numRows() {
      return Math.max(this.prevRows.length, this.currRows.length);
    },
    numCols() {
      return Math.max(
        this.prevRows.length > 0 ? this.prevRows[0].length : 0,
        this.currRows.length > 0 ? this.currRows[0].length : 0
      );
    },
    diffRows() {
      const diffs = [];
      for (let i = 0; i < this.numRows; i += 1) {
        const prevRow = this.prevRows[i];
        const currRow = this.currRows[i];
        const newRow = [];
        for (let j = 0; j < this.numCols; j += 1) {
          const prevCell = (prevRow && prevRow[j]) || '';
          const currCell = (currRow && currRow[j]) || '';
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
