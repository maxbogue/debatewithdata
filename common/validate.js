// Validation functions for item objects. These functions are designed to
// validate the core data fields of the three main item types: sources, claims,
// and topics.

import forOwn from 'lodash/forOwn';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import validate from 'validate.js';

import { SourceType, SOURCE_TYPES } from './constants';

export class ValidationError extends Error {}

validate.validators.length.tooShort =
    'Too short (minimum is %{count} characters).';
validate.validators.presence.options = { message: 'Can\'t be blank.' };
validate.validators.url.options = { message: 'Must be a valid URL.' };

const CUSTOM_VALIDATORS = ['presenceIff', 'validIfDeleted'];

function validatePresenceIff(value, item, conds) {
  forOwn(conds, (v, k) => {
    let exists = !validate.isEmpty(value);
    let p = validate.isArray(v) ? v.includes(item[k]) : v === item[k];
    if (p && !exists) {
      throw new ValidationError(`Required for ${k} == ${item[k]}.`);
    } else if (!p && exists) {
      throw new ValidationError(`Forbidden for ${k} == ${item[k]}.`);
    }
  });
}

function constraintToValidator(constraint) {
  let validator = function (value, item) {
    if (item) {
      if (item.deleted && !constraint.validIfDeleted) {
        if (validate.isDefined(value)) {
          throw new ValidationError('Must be null for deleted item.');
        } else {
          return;
        }
      }
      if (constraint.presenceIff) {
        validatePresenceIff(value, item, constraint.presenceIff);
      }
    }
    let errors = validate.single(value, omit(constraint, CUSTOM_VALIDATORS));
    if (errors) {
      throw new ValidationError(errors[0]);
    }
  };
  validator.forDb = {
    dwdValidator: function (val) {
      validator(val, this);
    },
  };
  return validator;
}

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
