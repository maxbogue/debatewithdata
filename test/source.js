import chai from 'chai';

import { Source, SourceRev } from '../models';
import { registerAndVerifyUser } from './utils';

const expect = chai.expect;

const URL = 'https://debatewithdata.org';
const URL2 = 'https://dev.debatewithdata.org';
const TEXT = 'description 1';
const TEXT2 = 'description 2';
const INSTITUTION = 'institution';
const PUBLICATION = 'publication';
const MISC = {
  url: URL,
  text: TEXT,
  type: 'misc',
};
const MISC2 = {
  url: URL2,
  text: TEXT2,
  type: 'misc',
};
const RESEARCH = {
  url: URL,
  text: TEXT,
  type: 'research',
  institution: INSTITUTION,
  publication: PUBLICATION,
};
const ARTICLE = {
  url: URL,
  text: TEXT,
  type: 'article',
  publication: PUBLICATION,
  firstHand: true,
};
const AUTHORITY = {
  url: URL,
  text: TEXT,
  type: 'authority',
  institution: INSTITUTION,
};

describe('Source', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('happy misc', async function () {
      let rev = await Source.apiCreate(user, MISC);
      await rev.reload(SourceRev.INCLUDE());
      expect(rev.deleted).to.be.false;
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.type).to.equal('misc');
      expect(rev.institution).to.be.null;
      expect(rev.publication).to.be.null;
      expect(rev.firstHand).to.be.null;
      expect(rev.parentId).to.be.null;

      let source = await Source.findById(rev.sourceId);
      expect(source.headId).to.equal(rev.id);
    });

    it('happy research', async function () {
      let rev = await Source.apiCreate(user, RESEARCH);
      await rev.reload(SourceRev.INCLUDE());
      expect(rev.deleted).to.be.false;
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.type).to.equal('research');
      expect(rev.institution).to.equal(INSTITUTION);
      expect(rev.publication).to.equal(PUBLICATION);
      expect(rev.firstHand).to.be.null;
      expect(rev.parentId).to.be.null;

      let source = await Source.findById(rev.sourceId);
      expect(source.headId).to.equal(rev.id);
    });

    it('happy article', async function () {
      let rev = await Source.apiCreate(user, ARTICLE);
      await rev.reload(SourceRev.INCLUDE());
      expect(rev.deleted).to.be.false;
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.type).to.equal('article');
      expect(rev.institution).to.be.null;
      expect(rev.publication).to.equal(PUBLICATION);
      expect(rev.firstHand).to.be.true;
      expect(rev.parentId).to.be.null;

      let source = await Source.findById(rev.sourceId);
      expect(source.headId).to.equal(rev.id);
    });

    it('happy authority', async function () {
      let rev = await Source.apiCreate(user, AUTHORITY);
      await rev.reload(SourceRev.INCLUDE());
      expect(rev.deleted).to.be.false;
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.type).to.equal('authority');
      expect(rev.institution).to.equal(INSTITUTION);
      expect(rev.publication).to.be.null;
      expect(rev.firstHand).to.be.null;
      expect(rev.parentId).to.be.null;

      let source = await Source.findById(rev.sourceId);
      expect(source.headId).to.equal(rev.id);
    });
  });

  describe('.apiUpdate()', function () {
    it('change', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiUpdate(source.id, user, MISC2);
      await rev2.reload(SourceRev.INCLUDE());
      expect(rev2.deleted).to.be.false;
      expect(rev2.userId).to.equal(user.id);
      expect(rev2.blob.text).to.equal(TEXT2);
      expect(rev2.url).to.equal(URL2);
      expect(rev2.type).to.equal('misc');

      expect(rev2.parentId).to.equal(rev1.id);

      await source.reload();
      expect(source.headId).to.equal(rev2.id);
    });

    it('no change no-op', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiUpdate(source.id, user, MISC);
      expect(rev2.id).to.equal(rev1.id);
      expect(rev2.parentId).to.be.null;
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user);
      expect(rev2.deleted).to.be.true;
      expect(rev2.userId).to.equal(user.id);
      expect(rev2.blobHash).to.be.null;
      expect(rev2.url).to.be.null;
      expect(rev2.type).to.be.null;
      expect(rev2.institution).to.be.null;
      expect(rev2.publication).to.be.null;
      expect(rev2.firstHand).to.be.null;
      expect(rev2.parentId).to.equal(rev1.id);

      await source.reload();
      expect(source.headId).to.equal(rev2.id);
    });

    it('already deleted no-op', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user);
      expect(rev2.deleted).to.be.true;
      expect(rev2.parentId).to.equal(rev1.id);
      await source.reload();
      expect(source.headId).to.equal(rev2.id);

      let rev3 = await Source.apiDelete(source.id, user);
      expect(rev3.id).to.equal(rev2.id);
      expect(rev3.parentId).to.equal(rev1.id);
    });
  });

  describe('.apiGet()', function () {
    it('source exists', async function () {
      let rev = await Source.apiCreate(user, MISC);
      let sourceData = await Source.apiGet(rev.sourceId);

      expect(sourceData).to.deep.equal({
        sources: {
          [rev.sourceId]: {
            rev: rev.id,
            commentCount: 0,
            ...MISC,
          },
        },
      });
    });

    it('source does not exist', function () {
      expect(Source.apiGet('bad id')).to.be.rejected;
    });

    it('source deleted', async function () {
      let r1 = await Source.apiCreate(user, MISC);
      let r2 = await Source.apiDelete(r1.sourceId, user);
      let sourceData = await Source.apiGet(r1.sourceId);
      expect(sourceData).to.deep.equal({
        sources: {
          [r1.sourceId]: {
            rev: r2.id,
            deleted: true,
            commentCount: 0,
          },
        }
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two sources', async function () {
      let s1r = await Source.apiCreate(user, RESEARCH);
      let s2r = await Source.apiCreate(user, ARTICLE);
      let sourcesData = await Source.apiGetAll();
      expect(sourcesData).to.deep.equal({
        [s1r.sourceId]: {
          rev: s1r.id,
          commentCount: 0,
          ...RESEARCH,
        },
        [s2r.sourceId]: {
          rev: s2r.id,
          commentCount: 0,
          ...ARTICLE,
        },
      });
    });

    it('excludes deleted', async function () {
      let s1r = await Source.apiCreate(user, RESEARCH);
      let s2r = await Source.apiCreate(user, ARTICLE);
      await Source.apiDelete(s2r.sourceId, user);
      let sourcesData = await Source.apiGetAll();
      expect(sourcesData).to.deep.equal({
        [s1r.sourceId]: {
          rev: s1r.id,
          commentCount: 0,
          ...RESEARCH,
        }
      });
    });
  });
});
