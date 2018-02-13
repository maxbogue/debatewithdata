import values from 'lodash/values';

export const SourceType = {
  MISC: 'misc',
  RESEARCH: 'research',
  ARTICLE: 'article',
  AUTHORITY: 'authority',
};

export const SOURCE_TYPES = values(SourceType);

export const PointType = {
  CLAIM: 'claim',
  SOURCE: 'source',
  TEXT: 'text',
  SUBCLAIM: 'subclaim',
};

export const POINT_TYPES = values(PointType);