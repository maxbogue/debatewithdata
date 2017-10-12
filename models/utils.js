import includes from 'lodash/includes';

const ID_CHARS = '0123456789abcdef';

export function genId(n = 12) {
  let chars = [];
  for (let i = 0; i < n; i++) {
    chars.push(ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]);
  }
  return chars.join('');
}

export function genRevId() {
  return genId(24);
}

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
