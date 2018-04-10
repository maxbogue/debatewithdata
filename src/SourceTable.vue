<template>
<div :class="$style.wrapper">
  <table :class="$style.table">
    <tr>
      <th v-for="(header, i) in rows[0]" :key="'header' + i">{{ header }}</th>
    </tr>
    <tr v-for="(row, i) in rows.slice(1)" :key="'row' + i">
      <td v-for="(cell, j) in row" :key="i + ',' + j">{{ cell }}</td>
    </tr>
  </table>
</div>
</template>

<script>
import { deserializeTable } from '../common/utils';

export default {
  props: {
    table: { type: String, required: true },
  },
  computed: {
    rows: function () {
      return deserializeTable(this.table);
    },
  },
};
</script>

<style lang="scss" module>
.wrapper {
  display: inline-block;
  max-height: 200px;
  overflow: auto;
}

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
