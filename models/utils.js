import crypto from 'crypto';

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
