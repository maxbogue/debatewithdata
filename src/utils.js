import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import md5 from 'md5';
import sortBy from 'lodash/sortBy';

export function pipe(...fns) {
  return fns.reduce((f, g) => (...args) => g(f(...args)));
}

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

// This random string acts as a seed to keep the sort stable.
const sortSeed = genId();

// Sorts randomly each page refresh. Requires a string or object with ID.
export function stableRandom(item) {
  if (typeof item === 'string') {
    return md5(item + sortSeed);
  } else if (item.id) {
    return md5(item.id + sortSeed);
  }
  throw Error('stableRandom requires a string or object with an ID.');
}

export function starCount(item) {
  return -item.star.count;
}

export function starred(item) {
  return !item.star.starred;
}

export function sortByStars(items) {
  return sortBy(items, [starred, starCount, stableRandom]);
}

function prepItem(item, id) {
  if (!item.id) {
    item.id = id;
  }
  return item;
}

function prepAndSortByStars(items) {
  return sortByStars(map(items, prepItem));
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
  filters: {
    toSideString: function (isFor) {
      return isFor === null ? 'neutral' : isFor ? 'for' : 'against';
    },
  },
  methods: {
    lookupClaim: function (claimId) {
      return this.$store.state.claims[claimId];
    },
    topicUrl: function (topicId) {
      return '/topic/' + topicId;
    },
    claimUrl: function (claimId, trail) {
      let url = '/claim/' + claimId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
    },
    sourceUrl: function (sourceId, trail) {
      let url = '/source/' + sourceId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
    },
  },
};
