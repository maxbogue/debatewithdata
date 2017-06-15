import map from 'lodash/map';

export function zipInnerWithIndex(xs, i) {
  return map(xs, (x) => [x, i]);
}

export function rotate(lists) {
  let retList = [];
  for (let i = 0; i < Math.max(...map(lists, (list) => list.length)); i++) {
    for (let j = 0; j < lists.length; j++) {
      if (i < lists[j].length) {
        retList.push(lists[j][i]);
      }
    }
  }
  return retList;
}

export function axiosErrorToString(error) {
  if (!error.response) {
    return 'Server not responding';
  } else if (error.response.status >= 500) {
    return 'Server error';
  }
  return error.response.data.message;
}
