import Diff from 'text-diff';
import dateFormat from 'dateformat';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import omit from 'lodash/omit';
import partition from 'lodash/partition';

import { ItemType, PointType } from './common/constants';

const textDiff = new Diff();
const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const TITLE_TEXT_LENGTH = 75;

export function titleFromText(text) {
  if (text.length < TITLE_TEXT_LENGTH) {
    return text;
  }
  return text.slice(0, TITLE_TEXT_LENGTH - 3) + '...';
}

export function pipe(...fns) {
  return fns.reduce((f, g) => (...args) => g(f(...args)));
}

export function diff(text1, text2) {
  const diffs = textDiff.main(text1, text2);
  textDiff.cleanupSemantic(diffs);
  return textDiff.prettyHtml(diffs);
}

export function walk(o, f) {
  if (isObject(o)) {
    f(o);
    forOwn(o, v => walk(v, f));
  } else if (isArray(o)) {
    forEach(o, v => walk(v, f));
  }
}

export function genId() {
  const chars = [];
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

export function combinePoints(claim, state) {
  const points = [{}, {}];
  if (!claim || claim.deleted) {
    return points;
  }
  forOwn(claim.subClaimIds, (isFor, id) => {
    points[isFor ? 0 : 1][id] = {
      ...state.claims[id],
      pointType: PointType.CLAIM,
    };
  });
  forOwn(claim.sourceIds, (isFor, id) => {
    points[isFor ? 0 : 1][id] = {
      ...state.sources[id],
      pointType: PointType.SOURCE,
    };
  });
  if (claim.newSubClaims) {
    for (const subClaim of claim.newSubClaims) {
      points[subClaim.isFor ? 0 : 1][subClaim.tempId] = {
        ...subClaim,
        pointType: PointType.NEW_CLAIM,
      };
    }
  }
  if (claim.newSources) {
    for (const source of claim.newSources) {
      points[source.isFor ? 0 : 1][source.tempId] = {
        ...source,
        pointType: PointType.NEW_SOURCE,
      };
    }
  }
  return points;
}

export function splitPoints(points) {
  const subClaimIds = {};
  const sourceIds = {};
  const newSubClaims = [];
  const newSources = [];
  for (let i = 0; i < points.length; i += 1) {
    for (const point of points[i]) {
      if (point.pointType === PointType.CLAIM) {
        subClaimIds[point.id] = i === 0;
      } else if (point.pointType === PointType.SOURCE) {
        sourceIds[point.id] = i === 0;
      } else if (point.pointType === PointType.NEW_CLAIM) {
        newSubClaims.push({
          ...omit(point, 'pointType'),
          isFor: i === 0,
        });
      } else if (point.pointType === PointType.NEW_SOURCE) {
        newSources.push({
          ...omit(point, 'pointType'),
          isFor: i === 0,
        });
      }
    }
  }
  return {
    subClaimIds,
    sourceIds,
    newSubClaims,
    newSources,
  };
}

export function filterLiving(items) {
  return filter(items, item => !item.deleted);
}

export function rotateWithIndexes(lists) {
  const retList = [];
  for (let i = 0; i < Math.max(...map(lists, list => list.length)); i++) {
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
  const inOld = id => oldIds.includes(id);
  const notInNew = id => !newIds.includes(id);

  let [inBoth, added] = partition(newIds, inOld);
  let removed = filter(oldIds, notInNew);

  added.sort();
  removed.sort();
  inBoth.sort();

  const zipWith = (ids, v) => map(ids, id => [data[id], v]);
  added = zipWith(added, 'ins');
  removed = zipWith(removed, 'del');
  inBoth = zipWith(inBoth, '');

  return added.concat(removed, inBoth);
}

// Diffs two { id: item } maps into [id, newItem, oldItem] sorted by added,
// removed, modified, and unmodified.
function diffItems(newItems, oldItems) {
  if (isArray(newItems)) {
    const newItemMap = {};
    for (const rev of newItems) {
      newItemMap[rev.id || rev.tempId] = rev;
    }
    newItems = newItemMap;
  }
  const inOld = id => oldItems[id];
  const notInNew = id => !newItems[id];

  const [inBoth, added] = partition(Object.keys(newItems), inOld);
  const removed = Object.keys(oldItems).filter(notInNew);

  added.sort();
  removed.sort();
  inBoth.sort();

  const ids = added.concat(removed, inBoth);
  return map(ids, id => [id, newItems[id], oldItems[id]]);
}

export function diffPoints(newItem, oldItem, state) {
  const newPoints =
    (newItem && newItem.points) || combinePoints(newItem, state);
  const oldPoints =
    (oldItem && oldItem.points) || combinePoints(oldItem, state);
  const pointDiffs = [];

  for (const i of [0, 1]) {
    pointDiffs.push(diffItems(newPoints[i], oldPoints[i]));
  }

  return pointDiffs;
}

export function itemErrorMessage(item) {
  if (!item) {
    return '[Not Found]';
  } else if (item.deleted) {
    if (item.deleteMessage) {
      return '[Deleted: ' + item.deleteMessage + ']';
    }
    return '[Deleted]';
  }
  return '';
}

export function parseTrail(queryTrail) {
  return queryTrail ? queryTrail.split(',') : [];
}

export function axiosErrorToString(error) {
  if (!error.response) {
    return 'Server not responding';
  } else if (error.response.status >= 500) {
    return 'Server error';
  }
  return error.response.data.message;
}

export const DwdUtilsMixin = {
  filters: {
    toSideString(isFor) {
      return isFor === null ? 'neutral' : isFor ? 'for' : 'against';
    },
    timestamp(isoDate, format = 'yyyy-mm-dd HH:MM') {
      const date = new Date(isoDate);
      return dateFormat(date, format);
    },
    shortTimestamp(isoDate) {
      const date = new Date(isoDate);
      if (Date.now() - date < ONE_DAY_MS) {
        return dateFormat(date, 'h:MMtt');
      }
      return dateFormat(date, 'yyyy-mm-dd');
    },
  },
  methods: {
    parseTrail,
    lookupSource(sourceId) {
      if (!sourceId) {
        return null;
      }
      return this.$store.state.sources[sourceId] || null;
    },
    lookupClaim(claimId) {
      if (!claimId) {
        return null;
      }
      return this.$store.state.claims[claimId] || null;
    },
    lookupTopic(topicId) {
      if (!topicId) {
        return null;
      }
      return this.$store.state.topics[topicId] || null;
    },
    lookupItem(type, id) {
      switch (type) {
        case ItemType.TOPIC:
          return this.lookupTopic(id);
        case ItemType.CLAIM:
          return this.lookupClaim(id);
        case ItemType.SOURCE:
          return this.lookupSource(id);
      }
      throw new Error(`Invalid item type: ${type}`);
    },
    lookupItemWithType({ type, id }) {
      const item = this.lookupItem(type, id);
      return { type, item };
    },
    displayItemType(type) {
      return type === ItemType.SOURCE ? 'data' : type;
    },
    topicUrl(topicId, trail) {
      let url = '/topic/' + topicId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
    },
    claimUrl(claimId, trail) {
      let url = '/claim/' + claimId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
    },
    sourceUrl(sourceId, trail) {
      let url = '/data/' + sourceId;
      if (trail && trail.length > 0) {
        url += '?trail=' + trail.join(',');
      }
      return url;
    },
    itemUrl(type, id, trail) {
      switch (type) {
        case ItemType.TOPIC:
          return this.topicUrl(id, trail);
        case ItemType.CLAIM:
          return this.claimUrl(id, trail);
        case ItemType.SOURCE:
          return this.sourceUrl(id, trail);
      }
      throw new Error(`Invalid item type: ${type}`);
    },
    apiUrl(type, id) {
      let url = '/api/' + type;
      if (id) {
        url += '/' + id;
      }
      return url;
    },
    appendToUrl(url, path) {
      if (url.includes('?')) {
        return url.replace('?', path + '?');
      }
      return url + path;
    },
  },
  mounted() {
    if (this.$options.mountedTriggersWatchers && this.$options.watch) {
      forOwn(this.$options.watch, f => f.call(this));
    }
  },
};
