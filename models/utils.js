import crypto from 'crypto';
import forOwn from 'lodash/forOwn';

import { Claim, Topic } from '../models';
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
  let data = await Topic.apiGetForTrail(ids, user);
  let claimsData = await Claim.apiGetForTrail(ids, user);
  addApiData(data, claimsData);
  return data;
}
