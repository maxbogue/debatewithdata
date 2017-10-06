import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

export function walk(o, f) {
  if (isObject(o)) {
    f(o);
    forOwn(o, (v) => walk(v, f));
  } else if (isArray(o)) {
    forEach(o, (v) => walk(v, f));
  }
}

export function genId() {
  let chars = [];
  for (let i = 0; i < 16; i++) {
    chars.push(Math.floor(Math.random() * 16).toString(16));
  }
  return chars.join('');
}

export function emptyPoint() {
  return { tempId: genId() };
}

export function emptyPoints() {
  return [[emptyPoint()], [emptyPoint()]];
}

export function pointToInput(point) {
  if (!point) {
    return '';
  }
  switch (point.type) {
  case 'claim':
    return point.claimId;
  case 'source':
    return point.sourceId;
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

function starCount(item) {
  return -item.star.count;
}

function prepItem(item, id) {
  item.id = id;
  return item;
}

export function prepAndSortByStars(items) {
  return sortBy(map(items, prepItem), [starCount, Math.random]);
}

export function pointMapsToLists(pointMaps) {
  return pointMaps.map(prepAndSortByStars);
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

export var DwdUtilsMixin = {
  methods: {
    claimUrl: function (claimId, trail) {
      let url = '/claim/' + claimId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
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
