import crypto from 'crypto';
import forOwn from 'lodash/forOwn';

import { Claim, Topic } from '../models';
import { Filter, Sort } from '../common/constants';
import { FlagData } from '../common/flag';

export function randomHexString(n) {
  if (n % 2 !== 0) {
    throw Error('Hex string must be even length.');
  }
  return crypto.randomBytes(n / 2).toString('hex');
}

export function genId() {
  return randomHexString(12);
}

export function genRevId() {
  return randomHexString(24);
}

export const ROOT_URL = process.env.NODE_ENV === 'production'
  ? 'https://debatewithdata.org' : 'https://dev.debatewithdata.org';

export function isValidFlag(flag) {
  if (!FlagData[flag]) {
    throw new Error('Invalid flag: ' + flag);
  }
}

function sortQuery(query, sort) {
  if (sort) {
    let [sortType, dir] = sort;
    if (sortType === Sort.STARS) {
      return query.orderBy('starCount', dir ? 'desc' : 'asc');
    } else if (sortType === Sort.RECENT) {
      return query.orderBy('h.created_at', dir ? 'desc' : 'asc');
    }
  }
  return query.orderBy('starCount', 'desc');
}

function filterQuery(query, filters) {
  if (filters && Filter.STARRED in filters) {
    return query.where('s.starred', filters[Filter.STARRED]);
  }
  return query;
}

export function sortAndFilterQuery(query, sort, filters) {
  return filterQuery(sortQuery(query, sort), filters);
}

// Modifies |data| by adding all data in |otherData| to it.
export function addApiData(data, otherData) {
  if (otherData.topics) {
    if (!data.topics) {
      data.topics = {};
    }
    forOwn(otherData.topics, (topic, id) => {
      data.topics[id] = topic;
    });
  }
  if (otherData.claims) {
    if (!data.claims) {
      data.claims = {};
    }
    forOwn(otherData.claims, (claim, id) => {
      if (!data.claims[id] || data.claims[id].depth <= claim.depth) {
        data.claims[id] = claim;
      }
    });
  }
  if (otherData.sources) {
    if (!data.sources) {
      data.sources = {};
    }
    forOwn(otherData.sources, (source, id) => {
      data.sources[id] = source;
    });
  }
}

export async function getTrailData(trail, user) {
  let ids = trail ? trail.split(',') : [];
  if (ids.length === 0) {
    return {};
  }
  let data = await Topic.apiGetAll(user, ids);
  let claimsData = await Claim.apiGetAll({ user, claimIds: ids });
  addApiData(data, claimsData);
  return data;
}
