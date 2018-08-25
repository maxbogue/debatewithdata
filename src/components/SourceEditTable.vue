<template>
<div :class="$style.dataTable">
  <span v-if="!rows" @click="addTable">Add Table</span>
  <template v-else>
    <span @click="addColumn">Add Column</span>
    | <span @click="deleteTable">Delete Table</span>
  </template>
  <table v-if="rows" :class="$style.table">
    <tr>
      <th :colspan="numCols">
        <textarea type="text"
                  placeholder="title (default units)"
                  :value="title"
                  @input="updateTitle($event.target.value)"
                  @keydown.188.prevent></textarea>
      </th>
    </tr>
    <tr>
      <th v-for="(_, i) in rows[0]" :key="'header' + i">
        <textarea type="text"
                  :placeholder="headerPlaceholder(i)"
                  :value="rows[0][i]"
                  @input="updateCell(0, i, $event.target.value)"
                  @keydown.188.prevent></textarea>
      </th>
    </tr>
    <tr v-for="(row, i) in rows.slice(1)" :key="i">
      <td v-for="(_, j) in row" :key="i + ',' + j">
        <textarea type="text"
                  :placeholder="j === 0 ? 'row label' : 'data'"
                  :value="rows[i + 1][j]"
                  @input="updateCell(i + 1, j, $event.target.value)"
                  @keydown.188.prevent></textarea>
      </td>
    </tr>
  </table>
</div>
</template>

<script>
import { deserializeTable, serializeTable } from '@/common/utils';

export default {
  props: {
    table: { type: String, default: null },
  },
  data: () => ({
    title: '',
    rows: null,
    initialized: false,
  }),
  computed: {
    numCols() {
      if (!this.rows) {
        return 0;
      }
      return this.rows[0].length;
    },
  },
  watch: {
    table() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (!this.initialized && this.table) {
        this.initialized = true;
        let rows = deserializeTable(this.table);
        if (rows[0].length === 1) {
          this.title = rows[0][0];
          this.rows = rows.slice(1);
        } else {
          this.title = '';
          this.rows = rows;
        }
      }
    },
    headerPlaceholder(col) {
      return col === 0 ? 'row label units' : 'column label (units)';
    },
    addTable() {
      this.rows = [['', ''], ['', ''], ['', '']];
      this.initialized = true;
    },
    addColumn() {
      for (let row of this.rows) {
        row.push('');
      }
    },
    deleteTable() {
      this.rows = null;
      this.$emit('update:table', null);
    },
    updateTitle(newTitle) {
      this.title = newTitle.replace(/,/g, '');
      this.emitTable();
    },
    updateCell(i, j, text) {
      let useTabs = text.includes('\t');
      let newRows = text.split('\n');
      for (let m = 0; m < newRows.length; m += 1) {
        if (i + m === this.rows.length) {
          this.rows.push(this.rows[0].map(() => ''));
        }
        let newCells = newRows[m].split(useTabs ? '\t' : ',');
        for (let n = 0; n < newCells.length; n += 1) {
          let t = newCells[n].replace(/,/g, '');
          if (j + n === this.rows[0].length) {
            this.addColumn();
          }
          this.$set(this.rows[i + m], j + n, t);
        }
      }
      this.updateRows();
    },
    updateRows() {
      this.initialized = true;

      // If every cell is empty, erase the table.
      if (this.rows.every((row) => row.every((cell) => !cell))) {
        this.$emit('update:table', null);
        return;
      }

      // Purge empty rows.
      for (let i = 2; i < this.rows.length - 1; i += 1) {
        while (i < this.rows.length - 1
            && this.rows[i].every((cell) => !cell)) {
          this.rows.splice(i, 1);
        }
      }

      // Add a new row if needed.
      let lastRow = this.rows[this.rows.length - 1];
      if (lastRow.some((cell) => cell)) {
        this.rows.push(this.rows[0].map(() => ''));
      }

      this.emitTable();
    },
    emitTable() {
      this.$emit('update:table', serializeTable(
        this.title, this.rows.slice(0, -1)));
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

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
