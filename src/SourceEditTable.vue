<template>
<div>
  <table :class="$style.table">
    <tr>
      <th v-for="(_, i) in rows[0]" :key="'header' + i">
        <input v-model="rows[0][i]" type="text">
      </th>
    </tr>
    <tr v-for="(row, i) in rows.slice(1)" :key="i">
      <td v-for="(_, j) in row" :key="i + ',' + j">
        <input v-model="rows[i + 1][j]" type="text">
      </td>
    </tr>
  </table>
</div>
</template>

<script>
import { deserializeTable, serializeTable } from '../common/utils';

export default {
  props: {
    table: { type: String, default: null },
  },
  data: () => ({
    rows: [['']],
    initialized: false,
  }),
  watch: {
    table: function () {
      this.init();
    },
    rows: function () {
      // If every cell is empty, erase the table.
      if (this.rows.every((row) => row.every((cell) => !cell))) {
        this.$emit('update:table', null);
        return;
      }

      // No commas!
      for (let i = 0; i < this.rows.length; i += 1) {
        for (let j = 0; j < this.rows[0].length; j += 1) {
          if (this.rows[i][j].includes(',')) {
            this.rows[i][j] = this.rows[i][j].replace(',', '');
          }
        }
      }

      // Add a new column if needed.
      let headers = this.rows[0];
      if (headers[headers.length - 1]) {
        for (let row of this.rows) {
          row.push('');
        }
      }

      // Purge empty rows.
      for (let i = 1; i < this.rows.length - 1; i += 1) {
        while (this.rows[i].every((cell) => !cell)) {
          this.rows.splice(i, 1);
        }
      }

      // Add a new row if needed.
      let lastRow = this.rows[this.rows.length - 1];
      if (lastRow.some((cell) => cell)) {
        this.rows.push(headers.map(() => ''));
      }

      this.$emit('update:table', serializeTable(this.rows.slice(0, -1).map(
          (row) => row.slice(0, -1))));
    },
  },
  mounted: function () {
    this.init();
  },
  methods: {
    init: function () {
      if (!this.initialized && this.table) {
        this.rows = deserializeTable(this.table);
        this.initialized = true;
      }
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
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  input {
    min-width: 50px;
    padding: 8px;
    border: none;
    line-height: 1;
  }
}
</style>
