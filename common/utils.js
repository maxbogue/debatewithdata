// An async version of lodash's forOwn function.
export async function asyncForOwn(obj, f) {
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      await f(obj[k], k, obj);
    }
  }
}

export function deserializeTable(tableString) {
  return tableString.split('\n').map((row) => row.split(','));
}

export function serializeTable(rows) {
  return rows.map((row) => row.join(',')).join('\n');
}
