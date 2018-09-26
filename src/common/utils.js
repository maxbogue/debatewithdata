export async function asyncForEach(xs, f) {
  const promises = [];
  for (const x of xs) {
    promises.push(f(x));
  }
  await Promise.all(promises);
}

// An async version of lodash's forOwn function.
export async function asyncForOwn(obj, f) {
  const promises = [];
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      promises.push(f(obj[k], k, obj));
    }
  }
  await Promise.all(promises);
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
