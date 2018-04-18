// An async version of lodash's forOwn function.
export async function asyncForOwn(obj, f) {
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      await f(obj[k], k, obj);
    }
  }
}

function stripCommas(s) {
  return s.replace(/,/g, '');
}

export function deserializeTable(tableString) {
  return tableString.split('\n').map((row) => row.split(','));
}

export function serializeTable(title, rows) {
  return [stripCommas(title)].concat(rows.map(
      (row) => row.map(stripCommas).join(','))).join('\n');
}
