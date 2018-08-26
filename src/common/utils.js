// An async version of lodash's forOwn function.
export async function asyncForOwn(obj, f) {
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      await f(obj[k], k, obj);
    }
  }
}

export function any(ls, f) {
  for (let e of ls) {
    if (f(e)) {
      return true;
    }
  }
  return false;
}

function stripTabs(s) {
  return s.replace(/\t/g, '');
}

export function deserializeTable(tableString) {
  const separator = tableString.includes('\t') ? '\t' : ',';
  return tableString.split('\n').map(row => row.split(separator));
}

export function serializeTable(title, rows) {
  return [stripTabs(title)]
    .concat(rows.map(row => row.map(stripTabs).join('\t')))
    .join('\n');
}
