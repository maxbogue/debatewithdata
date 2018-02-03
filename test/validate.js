import chai from 'chai';

import { SourceType } from '../common/constants';
import { ValidationError, validateSource } from '../common/validate';

const expect = chai.expect;

const GOOD_URL = 'http://debatewithdata.org';
const BAD_URL = 'debatewithdata.org';
const GOOD_TEXT = 'More than 10 characters.';
const BAD_TEXT = 'foo';

const BLANK_ERR = 'Can\'t be blank.';

describe('validate', function () {
  describe('source', function () {
    let expectValid = function (source) {
      expect(() => validateSource(source)).to.not.throw;
    };
    let expectInvalid = function (source) {
      expect(() => validateSource(source)).to.throw(ValidationError);
    };

    it('misc', function () {
      expectValid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.MISC,
      });
      // Missing type.
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
      });
      // Bad URL.
      expectInvalid({
        url: BAD_URL,
        text: GOOD_TEXT,
        type: SourceType.MISC,
      });
      // Bad text.
      expectInvalid({
        url: GOOD_URL,
        text: BAD_TEXT,
        type: SourceType.MISC,
      });
      // Invalid fields.
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.MISC,
        institution: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.MISC,
        publication: GOOD_TEXT,
      });
    });

    it('article', function () {
      expectValid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.ARTICLE,
        publication: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.ARTICLE,
        publication: '',
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.ARTICLE,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.ARTICLE,
        publication: GOOD_TEXT,
        institution: GOOD_TEXT,
      });
    });

    it('authority', function () {
      expectValid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.AUTHORITY,
        institution: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.AUTHORITY,
        institution: '',
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.AUTHORITY,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.AUTHORITY,
        institution: GOOD_TEXT,
        publication: GOOD_TEXT,
      });
    });

    it('research', function () {
      expectValid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.RESEARCH,
        publication: GOOD_TEXT,
        institution: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.RESEARCH,
        publication: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.RESEARCH,
        institution: GOOD_TEXT,
      });
      expectInvalid({
        url: GOOD_URL,
        text: GOOD_TEXT,
        type: SourceType.RESEARCH,
      });
    });

    it('deleted', function () {
      expectValid({
        deleted: true,
      });
      expectInvalid({
        deleted: true,
        // Type not allowed.
        type: SourceType.MISC,
      });
      expectInvalid({
        deleted: true,
        // URL not allowed.
        url: GOOD_URL,
      });
      expectInvalid({
        deleted: true,
        // Text not allowed.
        text: GOOD_TEXT,
      });
    });

    it('url', function () {
      let MSG = 'Must be a valid URL.';
      let v = (url, source) => () => validateSource.url(url, source);
      expect(v(GOOD_URL)).to.not.throw;
      expect(v(BAD_URL)).to.throw(MSG);
      expect(v('')).to.throw(MSG);
      expect(v()).to.throw(BLANK_ERR);
      expect(v(GOOD_URL, { deleted: true })).to.throw(ValidationError);
    });
  });
});
