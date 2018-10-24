import md5 from 'md5';
import sortBy from 'lodash/fp/sortBy';

import { combinePoints, genId } from '@/utils';

export default () => ({
  namespaced: true,
  state: {
    seed: genId(),
  },
  getters: {
    // Sorts randomly each page refresh. Requires a string or object with ID.
    stableRandom: state => item => {
      if (typeof item === 'string') {
        return md5(item + state.seed);
      } else if (item.id) {
        return md5(item.id + state.seed);
      }
      throw Error('stableRandom requires a string or object with an ID.');
    },
    starCount: () => item => ('starCount' in item ? -item.starCount : 0),
    starred: () => item => ('starred' in item ? !item.starred : false),
    sortByStars: (state, getters) => items =>
      sortBy([getters.starred, getters.starCount, getters.stableRandom], items),
    combineAndSortPoints: (state, getters, rootState) => claim =>
      combinePoints(claim, rootState).map(getters.sortByStars),
  },
});
