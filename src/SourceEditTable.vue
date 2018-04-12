<template>
<div :class="$style.dataTable">
  <span v-if="!rows" @click="rows = [['']]">Add Table</span>
  <template v-else>
    <span @click="addColumn">Add Column</span>
    | <span @click="deleteTable">Delete Table</span>
  </template>
  <table v-if="rows" :class="$style.table">
    <tr>
      <th v-for="(_, i) in rows[0]" :key="'header' + i">
        <textarea type="text"
                  :value="rows[0][i]"
                  @input="updateCell(0, i, $event.target.value)"
                  @keydown.188.prevent></textarea>
      </th>
    </tr>
    <tr v-for="(row, i) in rows.slice(1)" :key="i">
      <td v-for="(_, j) in row" :key="i + ',' + j">
        <textarea type="text"
                  :value="rows[i + 1][j]"
                  @input="updateCell(i + 1, j, $event.target.value)"
                  @keydown.188.prevent></textarea>
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
    rows: null,
    initialized: false,
  }),
  watch: {
    table: function () {
      this.init();
    },
  },
  mounted: function () {
    this.init();
  },
  methods: {
    init: function () {
      if (!this.initialized && this.table) {
        this.rows = deserializeTable(this.table);
      }
    },
    addColumn: function () {
      for (let row of this.rows) {
        row.push('');
      }
    },
    deleteTable: function () {
      this.rows = null;
      this.$emit('update:table', null);
    },
    updateCell: function (i, j, text) {
      let useTabs = text.includes('\t');
      let newRows = text.split('\n');
      for (let m = 0; m < newRows.length; m += 1) {
        if (i + m === this.rows.length) {
          this.rows.push(this.rows[0].map(() => ''));
        }
        let newCells = newRows[m].split(useTabs ? '\t' : ',');
        for (let n = 0; n < newCells.length; n += 1) {
          let t = newCells[n].replace(/,/g, '');
          if (!t) {
            continue;
          }
          if (j + n === this.rows[0].length) {
            this.addColumn();
          }
          this.$set(this.rows[i + m], j + n, t);
        }
      }
      this.updateRows();
    },
    updateRows: function () {
      // If every cell is empty, erase the table.
      if (this.rows.every((row) => row.every((cell) => !cell))) {
        this.$emit('update:table', null);
        return;
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
        this.rows.push(this.rows[0].map(() => ''));
      }

      // If there was no table before, this needs to be set to prevent init.
      this.initialized = true;
      this.$emit('update:table', serializeTable(this.rows.slice(0, -1)));
    },
  },
};
</script>

<style lang="scss" module>
@import "style/constants";

.dataTable {
  span {
    font-size: 0.75em;
    font-weight: $font-weight-bold;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  table {
    border-collapse: collapse;
    font-size: 0.7em;

    th,
    td {
      border: 1px solid rgba(0, 0, 0, 0.2);
    }

    textarea {
      min-width: 50px;
      max-height: calc(1em + 16px);
      padding: 8px;
      border: none;
      line-height: 1;
    }
  }
}
</style>
