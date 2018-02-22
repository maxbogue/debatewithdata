import Diff from 'text-diff';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import md5 from 'md5';
import partition from 'lodash/partition';
import sortBy from 'lodash/sortBy';

const textDiff = new Diff();

export function pipe(...fns) {
  return fns.reduce((f, g) => (...args) => g(f(...args)));
}

export function diff(text1, text2) {
  let diffs = textDiff.main(text1, text2);
  textDiff.cleanupSemantic(diffs);
  return textDiff.prettyHtml(diffs);
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
  case 'newSource':
    return point.source.url;
  default:
    return '';
  }
}

export function isValidPoint(point) {
  return Boolean(pointToInput(point));
}

export function filterLiving(items) {
  return filter(items, (item) => !item.deleted);
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
  let livingItems = filterLiving(items);
  return sortBy(livingItems, [starred, starCount, stableRandom]);
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

// Takes two lists of IDs and an { id: item } map and computes the diff.
// Returns [[item, diffClass]] where |diffClass| is '', 'ins', or 'del'.
export function diffIdLists(newIds, oldIds, data) {
  let inOld = (id) => oldIds.includes(id);
  let notInNew = (id) => !newIds.includes(id);

  let [inBoth, added] = partition(newIds, inOld);
  let removed = filter(oldIds, notInNew);

  added.sort();
  removed.sort();
  inBoth.sort();

  let zipWith = (ids, v) => map(ids, (id) => [data[id], v]);
  added = zipWith(added, 'ins');
  removed = zipWith(removed, 'del');
  inBoth = zipWith(inBoth, '');

  return added.concat(removed, inBoth);
}

// Diffs two { id: rev } maps into [id, newRev, oldRev] sorted by added,
// removed, modified, and unmodified.
function diffRevs(newRevs, oldRevs) {
  let inOld = (id) => oldRevs[id];
  let notInNew = (id) => !newRevs[id];
  let isModified = (id) => newRevs[id] === oldRevs[id];

  let [inBoth, added] = partition(Object.keys(newRevs), inOld);
  let removed = Object.keys(oldRevs).filter(notInNew);
  let [modified, unmodified] = partition(inBoth, isModified);

  added.sort();
  removed.sort();
  modified.sort();
  unmodified.sort();

  let ids = added.concat(removed, modified, unmodified);
  return map(ids, (id) => [id, newRevs[id], oldRevs[id]]);
}

export function diffPointRevs(newItem, oldItem) {
  let newHasPoints = newItem && newItem.points;
  let oldHasPoints = oldItem && oldItem.points;
  let pointRevs = [];

  for (let i of [0, 1]) {
    let newPoints = newHasPoints ? newItem.points[i] : {};
    let oldPoints = oldHasPoints ? oldItem.points[i] : {};
    pointRevs.push(diffRevs(newPoints, oldPoints));
  }

  return pointRevs;
}

export var DwdUtilsMixin = {
  filters: {
    toSideString: function (isFor) {
      return isFor === null ? 'neutral' : isFor ? 'for' : 'against';
    },
  },
  methods: {
    lookupSource: function (sourceId) {
      if (!sourceId) {
        return null;
      }
      return this.$store.state.sources[sourceId] || null;
    },
    lookupClaim: function (claimId) {
      if (!claimId) {
        return null;
      }
      return this.$store.state.claims[claimId] || null;
    },
    lookupTopic: function (topicId) {
      if (!topicId) {
        return null;
      }
      return this.$store.state.topics[topicId] || null;
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
  mounted: function () {
    if (this.$options.mountedTriggersWatchers && this.$options.watch) {
      forOwn(this.$options.watch, (f) => f.call(this));
    }
  },
};
