// Validation functions for item objects. These functions are designed to
// validate the core data fields of the three main item types: sources, claims,
// and topics.

import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import validate from 'validate.js';

import { FlagData } from './flag';
import { PointType, SourceType, POINT_TYPES, SOURCE_TYPES } from './constants';

validate.validators.length.tooShort =
    'too short (minimum is %{count} characters).';
validate.validators.presence.options = { message: 'can\'t be blank.' };
validate.validators.url.options = { message: 'must be a valid URL.' };

const ID_REGEX = /^[0-9a-f]{12}$/;
const CUSTOM_VALIDATORS = ['presenceIff', 'validIfDeleted', 'custom'];

export class ValidationError extends Error {}

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

function validatePresenceIff(key, value, item, conds) {
  forOwn(conds, (v, k) => {
    let exists = !validate.isEmpty(value);
    let p = validate.isArray(v) ? v.includes(item[k]) : v === item[k];
    if (p && !exists) {
      throw new ValidationError(`"${key}" required for "${k}" = "${item[k]}".`);
    } else if (!p && exists) {
      throw new ValidationError(
          `"${key}" forbidden for "${k}" = "${item[k]}".`);
    }
  });
}

function constraintToValidator(constraint, key) {
  let validator = function (value, item) {
    if (item) {
      if (item.deleted && !constraint.validIfDeleted) {
        if (validate.isDefined(value)) {
          throw new ValidationError(`"${key}" must be null for deleted item.`);
        } else {
          return;
        }
      }
      if (constraint.presenceIff) {
        validatePresenceIff(key, value, item, constraint.presenceIff);
      }
    }
    if (value && constraint.custom) {
      constraint.custom(value, item);
    }
    let errors = validate.single(value, omit(constraint, CUSTOM_VALIDATORS));
    if (errors) {
      throw new ValidationError(`"${key}" ${errors[0]}`);
    }
  };
  validator.forDb = {
    dwdValidator: function (val) {
      validator(val, this);
    },
  };
  return validator;
}

/////////////
// Sources //
/////////////

const sourceConstraints = {
  url: { presence: true, url: true },
  text: { presence: true, length: { minimum: 10 } },
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

const sourceValidators = mapValues(sourceConstraints, constraintToValidator);

export function validateSource(source) {
  forOwn(sourceValidators, (f, k) => f(source[k], source));
}
validate.extend(validateSource, sourceValidators);

////////////
// Points //
////////////

function validatePoints(points) {
  if (points.length !== 2) {
    throw new ValidationError('"points" must be an array of 2.');
  }
  forEach(points[0], validatePoint);
  forEach(points[1], validatePoint);
}

const pointConstraints = {
  type: { presence: true, inclusion: POINT_TYPES },
  text: {
    presenceIff: { type: [PointType.TEXT, PointType.SUBCLAIM] },
    length: { minimum: 10 },
  },
  flag: { inclusion: { within: FlagData } },
  claimId: {
    presenceIff: { type: PointType.CLAIM },
    format: ID_REGEX,
  },
  sourceId: {
    presenceIff: { type: PointType.SOURCE },
    format: ID_REGEX,
  },
  points: {
    presenceIff: { type: PointType.SUBCLAIM },
    custom: validatePoints,
  },
};

const pointValidators = mapValues(pointConstraints, constraintToValidator);

export function validatePoint(point) {
  forOwn(pointValidators, (f, k) => f(point[k], point));
}
validate.extend(validatePoint, pointValidators);

////////////
// Claims //
////////////

const claimConstraints = {
  text: { presence: true, length: { minimum: 10 } },
  flag: { inclusion: { within: FlagData } },
  points: { presence: true, custom: validatePoints },
};

const claimValidators = mapValues(claimConstraints, constraintToValidator);

export function validateClaim(claim) {
  forOwn(claimValidators, (f, k) => f(claim[k], claim));
}
validate.extend(validateClaim, claimValidators);
