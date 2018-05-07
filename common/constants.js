import values from 'lodash/values';

export const SourceType = {
  MISC: 'misc',
  RESEARCH: 'research',
  ARTICLE: 'article',
  AUTHORITY: 'authority',
};

export const SOURCE_TYPES = values(SourceType);

export const ItemType = {
  TOPIC: 'topic',
  CLAIM: 'claim',
  SOURCE: 'source',
};

export const PointType = {
  CLAIM: 'claim',
  SOURCE: 'source',
  NEW_CLAIM: 'newClaim',
  NEW_SOURCE: 'newSource',

  // Deprecated.
  TEXT: 'text',
  SUBCLAIM: 'subclaim',
};

export const POINT_TYPES = [
  PointType.CLAIM,
  PointType.SOURCE,
  PointType.NEW_CLAIM,
  PointType.NEW_SOURCE,
];
