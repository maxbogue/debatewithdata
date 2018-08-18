import includes from 'lodash/includes';

import { ClientError } from '@/api/error';
import { Filter, Sort } from '@/common/constants';

export function parseFilters(filters) {
  if (!filters) {
    return {};
  }
  let filterMap = {};
  filters.split(',').forEach((s) => {
    if (!s) {
      throw new ClientError(`Malformed filter string: "${filters}"`);
    }
    if (s[0] !== '-' && s[0] !== '+') {
      throw new ClientError(`Filter must start with "+" or "-": "${s}"`);
    }
    let filter = s.slice(1);
    if (!includes(Filter, filter)) {
      throw new ClientError(`Invalid filter: "${filter}"`);
    }
    filterMap[filter] = s[0] === '+';
  });
  return filterMap;
}

export function parseSort(s) {
  if (!s) {
    return null;
  }
  if (s[0] !== '-' && s[0] !== '+') {
    throw new ClientError(`Sort must start with "+" or "-": "${s}"`);
  }
  let sort = s.slice(1);
  if (!includes(Sort, sort)) {
    throw new ClientError(`Invalid sort: "${sort}"`);
  }
  return [sort, s[0] === '+'];
}
