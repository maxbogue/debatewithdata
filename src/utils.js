import { map } from 'lodash';

export function isValidPoint(point) {
  return (point.type === 'claim' || point.type === 'source') && point.id
      || point.type === 'subclaim';
}

export function rotateWithIndexes(lists) {
  let retList = [];
  for (let i = 0; i < Math.max(...map(lists, (list) => list.length)); i++) {
    for (let j = 0; j < lists.length; j++) {
      if (i < lists[j].length) {
        retList.push([lists[j][i], j, i]);
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

export var DwdUtilsMixin = {
  methods: {
    claimUrl: function (claimId) {
      return '/claim/' + claimId;
    },
    sourceUrl: function (sourceId) {
      return '/source/' + sourceId;
    },
  },
};
