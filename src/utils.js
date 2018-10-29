import Diff from 'text-diff';
import dateFormat from 'dateformat';
import dropWhile1 from 'lodash/fp/dropWhile';
import filter from 'lodash/fp/filter';
import forEach1 from 'lodash/fp/forEach';
import forOwn1 from 'lodash/fp/forOwn';
import isArray from 'lodash/fp/isArray';
import isObject from 'lodash/fp/isObject';
import map1 from 'lodash/fp/map';
import mapValues1 from 'lodash/fp/mapValues';
import omit from 'lodash/fp/omit';
import partition from 'lodash/fp/partition';
import template1 from 'lodash/fp/template';

import { ItemType, PointType } from './common/constants';

const textDiff = new Diff();
const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const TITLE_TEXT_LENGTH = 75;

export const dropWhile = dropWhile1.convert({ cap: false });
export const forEach = forEach1.convert({ cap: false });
export const forOwn = forOwn1.convert({ cap: false });
export const map = map1.convert({ cap: false });
export const mapValues = mapValues1.convert({ cap: false });
export const template = template1.convert({ fixed: false });

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
    forOwn(v => walk(v, f), o);
  } else if (isArray(o)) {
    forEach(v => walk(v, f), o);
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
  forOwn((isFor, id) => {
    points[isFor ? 0 : 1][id] = {
      ...state.claims[id],
      pointType: PointType.CLAIM,
    };
  }, claim.subClaimIds);
  forOwn((isFor, id) => {
    points[isFor ? 0 : 1][id] = {
      ...state.sources[id],
      pointType: PointType.SOURCE,
    };
  }, claim.sourceIds);
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
          ...omit('pointType', point),
          isFor: i === 0,
        });
      } else if (point.pointType === PointType.NEW_SOURCE) {
        newSources.push({
          ...omit('pointType', point),
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

export const isItemAlive = item => item && !item.deleted;
export const filterLiving = filter(isItemAlive);

export function rotateWithIndexes(lists) {
  const retList = [];
  for (let i = 0; i < Math.max(...lists.map(list => list.length)); i++) {
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

  let [inBoth, added] = partition(inOld, newIds);
  let removed = filter(notInNew, oldIds);

  added.sort();
  removed.sort();
  inBoth.sort();

  const zipWith = (ids, v) => ids.map(id => [data[id], v]);
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

  const [inBoth, added] = partition(inOld, Object.keys(newItems));
  const removed = Object.keys(oldItems).filter(notInNew);

  added.sort();
  removed.sort();
  inBoth.sort();

  const ids = added.concat(removed, inBoth);
  return ids.map(id => [id, newItems[id], oldItems[id]]);
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
      forOwn(f => f.call(this), this.$options.watch);
    }
  },
};
