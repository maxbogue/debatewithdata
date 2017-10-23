import crypto from 'crypto';
import includes from 'lodash/includes';

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

export const Flag = {
  AD_HOMINEM: 'ad-hominem',
  AUTHORITY: 'authority',
  BANDWAGON: 'bandwagon',
  EMOTION: 'emotion',
  FALSE_CAUSE: 'false-cause',
  FALSE_DICHOTOMY: 'false-dichotomy',
  GENETIC: 'genetic',
  MIDDLE_GROUND: 'middle-ground',
  NATURE: 'nature',
  NON_SEQUITUR: 'non-sequitur',
  SLIPPERY_SLOPE: 'slippery-slope',
  STRAWMAN: 'strawman',
};

export function isValidFlag(flag) {
  if (!includes(Flag, flag)) {
    throw new Error('Invalid flag: ' + flag);
  }
}
