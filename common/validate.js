// Validation functions for item objects. These functions are designed to
// validate the core data fields of the three main item types: sources, claims,
// and topics.

import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import validate from 'validate.js';

import { FlagData } from './flag';
import { SourceType, SOURCE_TYPES } from './constants';
import { deserializeTable } from './utils';

validate.validators.format.message = 'has invalid format: "%{value}"';
validate.validators.length.tooShort =
    'too short (minimum is %{count} characters).';
validate.validators.presence.options = { message: 'can\'t be blank.' };
validate.validators.url.options = { message: 'must be a valid URL.' };

const ID_FORMAT = {
  pattern: /[0-9a-f]{12}/,
  message: 'must be 12 hex characters.',
};

const REV_ID_FORMAT = {
  pattern: /[0-9a-f]{24}/,
  message: 'must be 24 hex characters.',
};

const IS_OPTIONAL_BOOLEAN = {
  inclusion: {
    within: [true, false],
    message: '^must be a boolean',
  },
};

const IS_BOOLEAN = {
  ...IS_OPTIONAL_BOOLEAN,
  presence: true,
};

const CUSTOM_VALIDATORS = [
  'presenceIff',
  'presenceOnlyIf',
  'validIfDeleted',
  'custom',
  'arrayOf',
  'objectOf',
  'default',
];

export class ValidationError extends Error {
  constructor(key, message) {
    if (!message) {
      message = key;
      key = undefined;
    }
    super(key ? `"${key}" ${message}` : message);
    this.key = key;
  }
}

export function isValid(f, ...args) {
  try {
    f(...args);
  } catch (e) {
    if (e instanceof ValidationError) {
      return false;
    }
    throw e;
  }
  return true;
}

// Validates that a key is only present under certain conditions. Check is only
// if by default, if and only if when |iff| is true.
function validatePresenceIf(key, value, item, conds, iff) {
  forOwn(conds, (v, k) => {
    let exists = !validate.isEmpty(value);
    let p = validate.isArray(v) ? v.includes(item[k]) : v === item[k];
    if (iff && p && !exists) {
      throw new ValidationError(key, `required for "${k}" = "${item[k]}".`);
    } else if (!p && exists) {
      throw new ValidationError(key, `forbidden for "${k}" = "${item[k]}".`);
    }
  });
}

function constraintToValidator(constraint, key) {
  let validator = function (value, item) {
    if (item) {
      if (item.deleted && !constraint.validIfDeleted) {
        if (validate.isDefined(value)) {
          throw new ValidationError(key, 'must be null for deleted item.');
        } else {
          return;
        }
      }
      if (constraint.presenceIff) {
        validatePresenceIf(key, value, item, constraint.presenceIff, true);
      }
      if (constraint.presenceOnlyIf) {
        validatePresenceIf(key, value, item, constraint.presenceOnlyIf, false);
      }
      if (constraint.default && !validate.isDefined(value)) {
        item[key] = constraint.default();
      }
    }
    if (validate.isDefined(value) && constraint.custom) {
      constraint.custom(value, key, item);
    }
    if (validate.isDefined(value) && constraint.arrayOf) {
      if (!validate.isArray(value)) {
        throw new ValidationError(key, 'must be an array.');
      }
      forEach(value, (e, i) => {
        let elementValidator = constraintToValidator(
            constraint.arrayOf, `${key}[${i}]`);
        elementValidator(e, item);
      });
    }
    if (validate.isDefined(value) && constraint.objectOf) {
      if (!validate.isObject(value)) {
        throw new ValidationError(key, 'must be an object.');
      }
      forEach(value, (v, k) => {
        if (constraint.objectOf.key) {
          let keyValidator = constraintToValidator(
              constraint.objectOf.key, `${key}.${k}`);
          keyValidator(k, item);
        }
        if (constraint.objectOf.value) {
          let valueValidator = constraintToValidator(
              constraint.objectOf.value, `${key}.${k}`);
          valueValidator(v, item);
        }
      });
    }
    let errors = validate.single(value, omit(constraint, CUSTOM_VALIDATORS));
    if (errors) {
      throw new ValidationError(key, errors[0]);
    }
  };
  validator.forDb = {
    dwdValidator: function (val) {
      validator(val, this);
    },
  };
  validator.emptyAsNull = (val) => validator(val === '' ? null : val);
  return validator;
}

const commonConstraints = {
  baseRev: { format: REV_ID_FORMAT },
  deleteMessage: {
    validIfDeleted: true,
    presenceIff: { deleted: true },
    length: { minimum: 10 },
  },
};

/////////////
// Sources //
/////////////

const DATE_REGEX = /^(\d{4})(?:-(\d\d)(?:-(\d\d))?)?$/;

function validateDate(s, key) {
  let match = s.match(DATE_REGEX);
  if (!match) {
    throw new ValidationError(key, 'must be formatted like YYYY[-MM[-DD]].');
  }
  // Uses the lexicographical ordering of ISO strings.
  if (s > new Date().toISOString().slice(0, 10)) {
    throw new ValidationError(key, 'must be in the past.');
  }
  if (match[2]) {
    let d = new Date(s);
    if (!d || d.getUTCMonth() + 1 !== Number(match[2])) {
      throw new ValidationError(key, 'must be a valid date.');
    }
  }
}

function validateTable(t, key) {
  let table = deserializeTable(t);
  if (table.length < 2) {
    throw new ValidationError(key, 'must have a title and data.');
  }
  if (table[0].length !== 1) {
    throw new ValidationError(key, 'missing title.');
  }
  let rows = table.slice(1);
  if (rows[0].length <2) {
    throw new ValidationError(key, 'rows must have two columns.');
  }
  if (!rows.every((row) => row.length === rows[0].length)) {
    throw new ValidationError(key, 'rows must all be the same length.');
  }
}

function validateChart(c, key) {
  if (typeof c !== 'object') {
    throw new ValidationError(key, 'must be an object.');
  }
}

export const sourceConstraints = {
  id: { format: ID_FORMAT },
  url: { presence: true, url: true },
  text: { presence: true, length: { minimum: 10 } },
  date: { custom: validateDate },
  table: { custom: validateTable },
  chart: { custom: validateChart },
  type: { presence: true, inclusion: SOURCE_TYPES },
  institution: {
    presenceIff: {
      type: [SourceType.RESEARCH, SourceType.AUTHORITY],
    },
    length: { minimum: 3 },
  },
  publication: {
    presenceIff: {
      type: [SourceType.RESEARCH, SourceType.ARTICLE],
    },
    length: { minimum: 3 },
  },
};

const sourceValidators = mapValues({
  ...commonConstraints,
  ...sourceConstraints,
}, constraintToValidator);

export function validateSource(source) {
  forOwn(sourceValidators, (f, k) => f(source[k], source));
}
validate.extend(validateSource, sourceValidators);

////////////
// Claims //
////////////

export const claimConstraints = {
  id: { format: ID_FORMAT },
  text: { presence: true, length: { minimum: 10 } },
  flag: { inclusion: { within: FlagData } },
  needsData: IS_OPTIONAL_BOOLEAN,
  subClaimIds: {
    default: () => ({}),
    objectOf: {
      key: {
        format: ID_FORMAT,
      },
      value: IS_BOOLEAN,
    },
  },
  sourceIds: {
    default: () => ({}),
    objectOf: {
      key: {
        format: ID_FORMAT,
      },
      value: IS_BOOLEAN,
    },
  },
  newSubClaims: {},
  newSources: {},
};

const claimValidators = mapValues({
  ...commonConstraints,
  ...claimConstraints,
}, constraintToValidator);

export function validateClaim(claim) {
  forOwn(claimValidators, (f, k) => f(claim[k], claim));
}
validate.extend(validateClaim, claimValidators);

////////////
// Topics //
////////////

const TOPIC_ID_FORMAT = {
  pattern: /^[a-z0-9-]+$/,
  message: 'must be lowercase letters, numbers, or dashes.',
};

export const topicConstraints = {
  id: { format: TOPIC_ID_FORMAT },
  title: { presence: { allowEmpty: false } },
  text: { presence: true },
  subTopicIds: {
    default: () => [],
    arrayOf: {
      format: TOPIC_ID_FORMAT,
    },
  },
  claimIds: {
    default: () => [],
    arrayOf: {
      format: ID_FORMAT,
    },
  },
  newSubTopics: {},
  newClaims: {},
};

const topicValidators = mapValues({
  ...commonConstraints,
  ...topicConstraints,
}, constraintToValidator);

export function validateTopic(topic) {
  forOwn(topicValidators, (f, k) => f(topic[k], topic));
}
validate.extend(validateTopic, topicValidators);
