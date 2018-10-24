import crypto from 'crypto';

import { Claim, Topic } from '@/models';
import { FlagData } from '@/common/flag';
import { forOwn } from '@/utils';

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

export const ROOT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://debatewithdata.org'
    : 'https://dev.debatewithdata.org';

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
    forOwn((topic, id) => {
      data.topics[id] = topic;
    }, otherData.topics);
  }
  if (otherData.claims) {
    if (!data.claims) {
      data.claims = {};
    }
    forOwn((claim, id) => {
      if (!data.claims[id] || data.claims[id].depth <= claim.depth) {
        data.claims[id] = claim;
      }
    }, otherData.claims);
  }
  if (otherData.sources) {
    if (!data.sources) {
      data.sources = {};
    }
    forOwn((source, id) => {
      data.sources[id] = source;
    }, otherData.sources);
  }
}

export async function getTrailData(trail, user) {
  if (trail.length === 0) {
    return {};
  }
  const data = await Topic.apiGetForTrail(trail, user);
  const claimsData = await Claim.apiGetForTrail(trail, user);
  addApiData(data, claimsData);
  return data;
}
