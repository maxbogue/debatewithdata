import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { STARS_AND_COMMENTS, registerAndVerifyUser } from './utils';
import { Claim, Source, SourceRev } from '../src/models';
import { ConflictError, NotFoundError } from '../src/api/error';
import { Sort, SourceType } from '../src/common/constants';
import { ValidationError } from '../src/common/validate';
import { randomHexString } from '../src/models/utils';
import { serializeTable } from '../src/common/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const URL = 'https://debatewithdata.org';
const URL2 = 'https://dev.debatewithdata.org';
const TEXT = 'description 1';
const TEXT2 = 'description 2';
const DATE = '2017-05-01';
const INSTITUTION = 'institution';
const PUBLICATION = 'publication';
const MISC = {
  url: URL,
  text: TEXT,
  date: null,
  table: null,
  chart: null,
  type: SourceType.MISC,
  institution: null,
  publication: null,
};
const MISC2 = {
  url: URL2,
  text: TEXT2,
  date: DATE,
  table: null,
  chart: null,
  type: SourceType.MISC,
  institution: null,
  publication: null,
};
const RESEARCH = {
  url: URL,
  text: TEXT,
  date: null,
  table: null,
  chart: null,
  type: SourceType.RESEARCH,
  institution: INSTITUTION,
  publication: PUBLICATION,
};
const ARTICLE = {
  url: URL,
  text: TEXT,
  date: null,
  table: null,
  chart: null,
  type: SourceType.ARTICLE,
  institution: null,
  publication: PUBLICATION,
};
const AUTHORITY = {
  url: URL,
  text: TEXT,
  date: null,
  table: null,
  chart: null,
  type: SourceType.AUTHORITY,
  institution: INSTITUTION,
  publication: null,
};

const DELETE_MSG = 'Violates guidelines.';

function createRandomTable() {
  let tabData = [];
  for (let i = 0; i < 10; i += 1) {
    tabData.push(randomHexString(6));
  }
  return serializeTable('title', [tabData]);
}

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
      expect(rev.date).to.be.null;
      expect(rev.table).to.be.undefined;
      expect(rev.type).to.equal(SourceType.MISC);
      expect(rev.institution).to.be.null;
      expect(rev.publication).to.be.null;
      expect(rev.parentId).to.be.null;

      let source = await Source.findById(rev.sourceId);
      expect(source.headId).to.equal(rev.id);
    });

    it('validation', async function () {
      await expect(Source.apiCreate(user, {
        url: 'debatewithdata.org',
        text: TEXT,
        type: SourceType.MISC,
      })).to.be.rejectedWith(ValidationError);
      await expect(Source.apiCreate(user, {
        url: URL,
        text: 'short',
        type: SourceType.MISC,
      })).to.be.rejectedWith(ValidationError);
      await expect(Source.apiCreate(user, {
        url: URL,
        text: TEXT,
        type: SourceType.ARTICLE,
      })).to.be.rejectedWith(ValidationError);
    });

    it('happy research', async function () {
      let rev = await Source.apiCreate(user, RESEARCH);
      await rev.reload(SourceRev.INCLUDE());
      expect(rev.deleted).to.be.false;
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.type).to.equal(SourceType.RESEARCH);
      expect(rev.institution).to.equal(INSTITUTION);
      expect(rev.publication).to.equal(PUBLICATION);
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
      expect(rev.type).to.equal(SourceType.ARTICLE);
      expect(rev.institution).to.be.null;
      expect(rev.publication).to.equal(PUBLICATION);
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
      expect(rev.type).to.equal(SourceType.AUTHORITY);
      expect(rev.institution).to.equal(INSTITUTION);
      expect(rev.publication).to.be.null;
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

      let rev2 = await Source.apiUpdate(source.id, user, {
        ...MISC2,
        baseRev: rev1.id,
      });
      await rev2.reload(SourceRev.INCLUDE());
      expect(rev2.deleted).to.be.false;
      expect(rev2.userId).to.equal(user.id);
      expect(rev2.blob.text).to.equal(TEXT2);
      expect(rev2.url).to.equal(URL2);
      expect(rev2.date).to.equal(DATE);
      expect(rev2.type).to.equal(SourceType.MISC);

      expect(rev2.parentId).to.equal(rev1.id);

      await source.reload();
      expect(source.headId).to.equal(rev2.id);
    });

    it('no change no-op', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiUpdate(source.id, user, {
        ...MISC,
        baseRev: rev1.id,
      });
      expect(rev2.id).to.equal(rev1.id);
      expect(rev2.parentId).to.be.null;
    });

    it('baseRev', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let sourceId = rev1.sourceId;
      await Source.apiUpdate(sourceId, user, {
        ...MISC2,
        baseRev: rev1.id,
      });

      // No baseRev.
      await expect(Source.apiUpdate(sourceId, user, MISC))
        .to.be.rejectedWith(ValidationError);
      // Garbage baseRev.
      await expect(Source.apiUpdate(sourceId, user, {
        ...MISC,
        baseRev: 'jklsahfjklashd',
      })).to.be.rejectedWith(ValidationError);
      // Invalid baseRev.
      await expect(Source.apiUpdate(sourceId, user, {
        ...MISC,
        baseRev: rev1.id,
      })).to.be.rejectedWith(ConflictError);
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user, DELETE_MSG);
      expect(rev2.deleted).to.be.true;
      expect(rev2.userId).to.equal(user.id);
      expect(rev2.blobHash).to.be.null;
      expect(rev2.url).to.be.null;
      expect(rev2.type).to.be.null;
      expect(rev2.institution).to.be.null;
      expect(rev2.publication).to.be.null;
      expect(rev2.parentId).to.equal(rev1.id);

      await source.reload();
      expect(source.headId).to.equal(rev2.id);
    });

    it('already deleted no-op', async function () {
      let rev1 = await Source.apiCreate(user, MISC);
      let source = await Source.findById(rev1.sourceId);
      expect(source.headId).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user, DELETE_MSG);
      expect(rev2.deleted).to.be.true;
      expect(rev2.parentId).to.equal(rev1.id);
      await source.reload();
      expect(source.headId).to.equal(rev2.id);

      let rev3 = await Source.apiDelete(source.id, user, DELETE_MSG);
      expect(rev3.id).to.equal(rev2.id);
      expect(rev3.parentId).to.equal(rev1.id);
    });
  });

  describe('.apiGet()', function () {
    it('source exists', async function () {
      let rev = await Source.apiCreate(user, MISC);
      let sourceData = await Source.apiGet(rev.sourceId, user);

      expect(sourceData).to.deep.equal({
        sources: {
          [rev.sourceId]: {
            id: rev.sourceId,
            revId: rev.id,
            claimIds: [],
            ...MISC,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });

    it('source does not exist', function () {
      expect(Source.apiGet('bad id')).to.be.rejected;
    });

    it('source deleted', async function () {
      let r1 = await Source.apiCreate(user, MISC);
      let r2 = await Source.apiDelete(r1.sourceId, user, DELETE_MSG);
      let sourceData = await Source.apiGet(r1.sourceId, user);
      expect(sourceData).to.deep.equal({
        sources: {
          [r2.sourceId]: {
            id: r2.sourceId,
            revId: r2.id,
            deleted: true,
            deleteMessage: DELETE_MSG,
            claimIds: [],
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });

    it('with table', async function () {
      let table = createRandomTable();
      let sourceRev = await Source.apiCreate(user, {
        ...MISC,
        table,
      });
      let sourceId = sourceRev.sourceId;

      let sourceData = await Source.apiGet(sourceId, user);
      expect(sourceData).to.deep.equal({
        sources: {
          [sourceId]: {
            id: sourceId,
            revId: sourceRev.id,
            ...MISC,
            table,
            claimIds: [],
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });

    it('with claim', async function () {
      let sourceRev = await Source.apiCreate(user, MISC);
      let sourceId = sourceRev.sourceId;
      let claimRev = await Claim.apiCreate(user, {
        text: TEXT2,
        sourceIds: {
          [sourceId]: true,
        }
      });

      let sourceData = await Source.apiGet(sourceId, user);
      expect(sourceData).to.deep.equal({
        sources: {
          [sourceId]: {
            id: sourceId,
            revId: sourceRev.id,
            claimIds: [claimRev.claimId],
            ...MISC,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {
          [claimRev.claimId]: {
            id: claimRev.claimId,
            revId: claimRev.id,
            text: TEXT2,
            flag: null,
            needsData: null,
            depth: 1,
            childCount: 1,
            dataCounts: [1, 0],
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two sources', async function () {
      let s1r = await Source.apiCreate(user, RESEARCH);
      let s2r = await Source.apiCreate(user, ARTICLE);
      let sourcesData = await Source.apiGetAll({
        user,
        sort: [Sort.RECENT, false],
      });
      expect(sourcesData).to.deep.equal({
        results: [s1r.sourceId, s2r.sourceId],
        numPages: 1,
        sources: {
          [s1r.sourceId]: {
            id: s1r.sourceId,
            revId: s1r.id,
            ...RESEARCH,
            ...STARS_AND_COMMENTS,
          },
          [s2r.sourceId]: {
            id: s2r.sourceId,
            revId: s2r.id,
            ...ARTICLE,
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });

    it('with table', async function () {
      let table = createRandomTable();
      let s1r = await Source.apiCreate(user, {
        ...MISC,
        table,
      });
      let sourceData = await Source.apiGetAll({ user });
      expect(sourceData).to.deep.equal({
        results: [s1r.sourceId],
        numPages: 1,
        sources: {
          [s1r.sourceId]: {
            id: s1r.sourceId,
            revId: s1r.id,
            ...MISC,
            table,
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });

    it('excludes deleted', async function () {
      let s1r = await Source.apiCreate(user, RESEARCH);
      let s2r = await Source.apiCreate(user, ARTICLE);
      await Source.apiDelete(s2r.sourceId, user, DELETE_MSG);
      let sourcesData = await Source.apiGetAll({ user });
      expect(sourcesData).to.deep.equal({
        results: [s1r.sourceId],
        numPages: 1,
        sources: {
          [s1r.sourceId]: {
            id: s1r.sourceId,
            revId: s1r.id,
            ...RESEARCH,
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });
  });

  describe('.apiGetRevs()', function () {
    it('change', async function () {
      let r1 = await Source.apiCreate(user, MISC);
      let sourceId = r1.sourceId;
      let r2 = await Source.apiUpdate(sourceId, user, {
        ...MISC2,
        baseRev: r1.id,
      });

      let data = await Source.apiGetRevs(sourceId);
      expect(data).to.deep.equal({
        sourceRevs: [{
          id: sourceId,
          revId: r2.id,
          username: user.username,
          createdAt: r2.created_at,
          ...MISC2,
        }, {
          id: sourceId,
          revId: r1.id,
          username: user.username,
          createdAt: r1.created_at,
          ...MISC,
        }],
      });
    });

    it('bad id', async function () {
      await expect(Source.apiGetRevs('bad id')).to.be.rejectedWith(
        NotFoundError);
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let r1 = await Source.apiCreate(user, MISC);
      let star = await Source.apiToggleStar(r1.sourceId, user);
      expect(star).to.deep.equal({
        starCount: 1,
        starred: true,
        watched: true,
      });
      star = await Source.apiToggleStar(r1.sourceId, user);
      expect(star).to.deep.equal({
        starCount: 0,
        starred: false,
        watched: true,
      });
    });
  });
});
