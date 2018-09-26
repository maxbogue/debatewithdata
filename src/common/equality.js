import forOwn from 'lodash/forOwn';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';

import {
  claimConstraints,
  sourceConstraints,
  topicConstraints,
} from './validate';

const SOURCE_FIELDS = keys(sourceConstraints);
const CLAIM_FIELDS = keys(claimConstraints);
const TOPIC_FIELDS = keys(topicConstraints);

// This function relies on the object being a copy of the original.
function adjustFields(obj) {
  delete obj.id;
  forOwn(obj, (v, k) => {
    // All arrays are currently order-less.
    if (isArray(v)) {
      if (v.length > 0) {
        obj[k] = new Set(v);
      } else {
        delete obj[k];
      }
    }
    // Null is the same as undefined for comparison.
    if (v === null || v === undefined) {
      delete obj[k];
    }
  });
  return obj;
}

function clean(obj, fields) {
  return adjustFields(pick(obj, fields));
}

export function sourcesAreEqual(s1, s2) {
  const a = clean(s1, SOURCE_FIELDS);
  const b = clean(s2, SOURCE_FIELDS);
  return isEqual(a, b);
}

export function claimsAreEqual(c1, c2) {
  const a = clean(c1, CLAIM_FIELDS);
  const b = clean(c2, CLAIM_FIELDS);
  return isEqual(a, b);
}

export function topicsAreEqual(t1, t2) {
  const a = clean(t1, TOPIC_FIELDS);
  const b = clean(t2, TOPIC_FIELDS);
  return isEqual(a, b);
}
