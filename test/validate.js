import chai from 'chai';

import { SourceType } from '@/common/constants';
import { validateSource, ValidationError } from '@/common/validate';

const expect = chai.expect;

const GOOD_URL = 'http://debatewithdata.org';
const BAD_URL = 'debatewithdata.org';
const GOOD_TEXT = 'More than 10 characters.';
const BAD_TEXT = 'foo';

describe('validate', function() {
  describe('source', function() {
    const expectValid = function(source) {
      expect(() => validateSource(source)).to.not.throw();
    };
    const expectInvalid = function(source) {
      expect(() => validateSource(source)).to.throw(ValidationError);
    };

    it('misc', function() {
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

    it('article', function() {
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

    it('authority', function() {
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

    it('research', function() {
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

    it('deleted', function() {
      const DELETE_MSG = 'Violates guidelines.';
      expectValid({
        deleted: true,
        deleteMessage: DELETE_MSG,
      });
      expectInvalid({
        deleted: true,
        // Missing message.
      });
      expectInvalid({
        deleted: true,
        deleteMessage: DELETE_MSG,
        // Type not allowed.
        type: SourceType.MISC,
      });
      expectInvalid({
        deleted: true,
        deleteMessage: DELETE_MSG,
        // URL not allowed.
        url: GOOD_URL,
      });
      expectInvalid({
        deleted: true,
        deleteMessage: DELETE_MSG,
        // Text not allowed.
        text: GOOD_TEXT,
      });
    });

    it('url', function() {
      const INVALID_URL = '"url" must be a valid URL.';
      const BLANK = '"url" can\'t be blank.';
      const v = (url, source) => () => validateSource.url(url, source);
      expect(v(GOOD_URL)).to.not.throw();
      expect(v(BAD_URL)).to.throw(INVALID_URL);
      expect(v('')).to.throw(INVALID_URL);
      expect(v()).to.throw(BLANK);
      expect(v(GOOD_URL, { deleted: true })).to.throw(ValidationError);
    });

    it('date', function() {
      const ev = function(d, m) {
        expect(() => validateSource.date(d), m).to.not.throw();
      };
      const ei = function(d, m) {
        expect(() => validateSource.date(d), m).to.throw(ValidationError);
      };

      ev('2017', 'Year only.');
      ev('2017-05', 'Year and month.');
      ev('2017-05-01', 'Full date.');
      ev('2016-02-29', 'Leap day.');
      ev('1918-11-11', '1900s.');

      ei('3000', 'No future dates.');
      ei('2017-02-29', '2017 is not a leap year.');
      ei('2017-11-31', 'November only has 30 days.');
      ei('', 'Empty.');
      ei('abc2017cba', 'Surrounded by letters.');
      ei('not a date', 'Words.');
    });
  });
});
