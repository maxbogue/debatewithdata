import { map } from 'lodash';

export function pointToInput(point) {
  if (!point) {
    return '';
  }
  switch (point.type) {
  case 'claim':
  case 'source':
    return point.id;
  case 'subclaim':
  case 'text':
    return point.text;
  default:
    return '';
  }
}

export function isValidPoint(point) {
  return Boolean(pointToInput(point));
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

export const FLAGS = {
  'ad-hominem': {
    name: 'Ad Hominem',
  },
  'appeal-to-authority': {
    name: 'Appeal to Authority',
  },
  'appeal-to-emotion': {
    name: 'Appeal to Emotion',
  },
  'appeal-to-nature': {
    name: 'Appeal to Nature',
  },
  'bandwagon': {
    name: 'Bandwagon',
  },
  'black-or-white': {
    name: 'False Dichotomy',
  },
  'false-cause': {
    name: 'False Cause',
  },
  'genetic': {
    name: 'Genetic',
  },
  'middle-ground': {
    name: 'Middle Ground',
  },
  'non-sequitur': {
    name: 'Non Sequitur',
  },
  'slippery-slope': {
    name: 'Slippery Slope',
  },
  'strawman': {
    name: 'Strawman',
  },
};
