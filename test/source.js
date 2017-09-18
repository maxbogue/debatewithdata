import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Source, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

const INCLUDE_ALL = { include: { all: true, nested: true } };

const URL = 'https://debatewithdata.org';
const URL2 = 'https://dev.debatewithdata.org';
const DESC = 'awesome website';
const ARY = 1;

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
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      let rev = source.head;
      rev.author.id.should.equal(user.id);
      rev.blob.text.should.equal(DESC);
      rev.source_id.should.equal(sourceId);
      should.not.exist(rev.ary);
      should.not.exist(rev.prev_rev_id);
    });

    it('happy with ary', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC, ARY);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      let rev = source.head;
      rev.author.id.should.equal(user.id);
      rev.blob.text.should.equal(DESC);
      rev.source_id.should.equal(sourceId);
      rev.ary.should.equal(ARY);
    });
  });

  describe('.apiUpdate()', function () {
    it('change', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      let prevRevId = source.head_id;
      (await source.apiUpdate(user, URL2, DESC)).should.be.true;

      source = await Source.findById(sourceId, INCLUDE_ALL);
      source.head.url.should.equal(URL2);
      source.head.prev_rev_id.should.equal(prevRevId);
    });

    it('no change no-op', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      let prevRevId = source.head_id;
      (await source.apiUpdate(user, URL, DESC)).should.be.false;
      source.head_id.should.equal(prevRevId);
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      let prevRevId = source.head_id;
      (await source.apiDelete(user)).should.be.true;

      source = await Source.findById(sourceId, INCLUDE_ALL);
      source.head.deleted.should.equal(true);
      source.head.prev_rev_id.should.equal(prevRevId);
    });

    it('already deleted no-op', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      (await source.apiDelete(user)).should.be.true;
      let prevRevId = source.head_id;
      (await source.apiDelete(user)).should.be.false;
      source.head_id.should.equal(prevRevId);
    });
  });

  describe('.getForApi()', function () {
    it('source exists', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let sourceForApi = await Source.getForApi(sourceId);
      sourceForApi.should.deep.equal({
        url: URL,
        text: DESC,
        ary: null,
      });
    });

    it('source does not exist', function () {
      Source.getForApi('bad id').should.be.rejected;
    });

    it('source deleted', async function () {
      let sourceId = await Source.apiCreate(user, URL, DESC);
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      (await source.apiDelete(user)).should.be.true;
      let sourceForApi = await Source.getForApi(sourceId);
      sourceForApi.should.deep.equal({
        deleted: true,
      });
    });
  });

  describe('.getAllForApi()', function () {
    it('two sources', async function () {
      let id1 = await Source.apiCreate(user, URL, DESC);
      let id2 = await Source.apiCreate(user, URL2, DESC, ARY);
      let sourcesForApi = await Source.getAllForApi();
      sourcesForApi.should.deep.equal({
        [id1]: {
          url: URL,
          text: DESC,
          ary: null,
        },
        [id2]: {
          url: URL2,
          text: DESC,
          ary: ARY,
        },
      });
    });

    it('excludes deleted', async function () {
      let id1 = await Source.apiCreate(user, URL, DESC);
      let id2 = await Source.apiCreate(user, URL2, DESC, ARY);
      let source2 = await Source.findById(id2, INCLUDE_ALL);
      (await source2.apiDelete(user)).should.be.true;
      let sourcesForApi = await Source.getAllForApi();
      sourcesForApi.should.deep.equal({
        [id1]: {
          url: URL,
          text: DESC,
          ary: null,
        },
      });
    });
  });
});
