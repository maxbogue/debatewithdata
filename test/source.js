import chai from 'chai';

import { sequelize, Source, User } from '../models';

const expect = chai.expect;

const URL = 'https://debatewithdata.org';
const URL2 = 'https://dev.debatewithdata.org';
const TEXT = 'description 1';
const TEXT2 = 'description 2';
const ARY = 1;
const ARY2 = 2;
const DATA = {
  url: URL,
  text: TEXT,
  ary: ARY,
};
const DATA2 = {
  url: URL2,
  text: TEXT2,
  ary: ARY2,
};

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

describe('Source', function () {
  let user;

  beforeEach(async function () {
    await sequelize.sync({ force: true });
    user = await User.register(USERNAME, PASSWORD, EMAIL);
  });

  describe('.apiCreate()', function () {
    it('happy', async function () {
      let rev = await Source.apiCreate(user, { url: URL, text: TEXT });
      await rev.reload(Source.INCLUDE_TEXT);
      expect(rev.deleted).to.be.false;
      expect(rev.user_id).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.ary).to.be.null;
      expect(rev.parent_id).to.be.null;

      let source = await Source.findById(rev.source_id);
      expect(source.head_id).to.equal(rev.id);
    });

    it('happy with ary', async function () {
      let rev = await Source.apiCreate(user, DATA);
      await rev.reload(Source.INCLUDE_TEXT);
      expect(rev.deleted).to.be.false;
      expect(rev.user_id).to.equal(user.id);
      expect(rev.blob.text).to.equal(TEXT);
      expect(rev.url).to.equal(URL);
      expect(rev.ary).to.equal(ARY);
      expect(rev.parent_id).to.be.null;

      let source = await Source.findById(rev.source_id);
      expect(source.head_id).to.equal(rev.id);
    });
  });

  describe('.apiUpdate()', function () {
    it('change', async function () {
      let rev1 = await Source.apiCreate(user, DATA);
      let source = await Source.findById(rev1.source_id);
      expect(source.head_id).to.equal(rev1.id);

      let rev2 = await Source.apiUpdate(source.id, user, DATA2);
      await rev2.reload(Source.INCLUDE_TEXT);
      expect(rev2.deleted).to.be.false;
      expect(rev2.user_id).to.equal(user.id);
      expect(rev2.blob.text).to.equal(TEXT2);
      expect(rev2.url).to.equal(URL2);
      expect(rev2.ary).to.equal(ARY2);
      expect(rev2.parent_id).to.equal(rev1.id);

      await source.reload();
      expect(source.head_id).to.equal(rev2.id);
    });

    it('no change no-op', async function () {
      let rev1 = await Source.apiCreate(user, DATA);
      let source = await Source.findById(rev1.source_id);
      expect(source.head_id).to.equal(rev1.id);

      let rev2 = await Source.apiUpdate(source.id, user, DATA);
      expect(rev2.id).to.equal(rev1.id);
      expect(rev2.parent_id).to.be.null;
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let rev1 = await Source.apiCreate(user, DATA);
      let source = await Source.findById(rev1.source_id);
      expect(source.head_id).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user);
      expect(rev2.deleted).to.be.true;
      expect(rev2.user_id).to.equal(user.id);
      expect(rev2.blob_hash).to.be.null;
      expect(rev2.url).to.be.null;
      expect(rev2.ary).to.be.null;
      expect(rev2.parent_id).to.equal(rev1.id);

      await source.reload();
      expect(source.head_id).to.equal(rev2.id);
    });

    it('already deleted no-op', async function () {
      let rev1 = await Source.apiCreate(user, DATA);
      let source = await Source.findById(rev1.source_id);
      expect(source.head_id).to.equal(rev1.id);

      let rev2 = await Source.apiDelete(source.id, user);
      expect(rev2.deleted).to.be.true;
      expect(rev2.parent_id).to.equal(rev1.id);
      await source.reload();
      expect(source.head_id).to.equal(rev2.id);

      let rev3 = await Source.apiDelete(source.id, user);
      expect(rev3.id).to.equal(rev2.id);
      expect(rev3.parent_id).to.equal(rev1.id);
    });
  });

  describe('.getForApi()', function () {
    it('source exists', async function () {
      let rev = await Source.apiCreate(user, DATA);
      let sourceForApi = await Source.getForApi(rev.source_id);
      expect(sourceForApi).to.deep.equal({
        rev: rev.id,
        ...DATA,
      });
    });

    it('source does not exist', function () {
      expect(Source.getForApi('bad id')).to.be.rejected;
    });

    it('source deleted', async function () {
      let rev = await Source.apiCreate(user, DATA);
      await Source.apiDelete(rev.source_id, user);
      let sourceForApi = await Source.getForApi(rev.source_id);
      expect(sourceForApi).to.deep.equal({
        rev: rev.id,
        deleted: true,
      });
    });
  });

  describe('.getAllForApi()', function () {
    it('two sources', async function () {
      let s1r = await Source.apiCreate(user, DATA);
      let s2r = await Source.apiCreate(user, DATA2);
      let sourcesForApi = await Source.getAllForApi();
      expect(sourcesForApi).to.deep.equal({
        [s1r.source_id]: {
          rev: s1r.id,
          ...DATA,
        },
        [s2r.source_id]: {
          rev: s2r.id,
          ...DATA2,
        },
      });
    });

    it('excludes deleted', async function () {
      let s1r = await Source.apiCreate(user, DATA);
      let s2r = await Source.apiCreate(user, DATA2);
      await Source.apiDelete(s2r.source_id, user);
      let sourcesForApi = await Source.getAllForApi();
      expect(sourcesForApi).to.deep.equal({
        [s1r.source_id]: {
          rev: s1r.id,
          ...DATA,
        }
      });
    });
  });
});
