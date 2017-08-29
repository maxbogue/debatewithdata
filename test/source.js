import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Source, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

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

  describe('.makeNew()', function () {
    it('happy case', async function () {
      let sourceId = await Source.makeNew(user, URL, DESC);
      let source = await Source.findById(sourceId, {
        include: { all: true, nested: true },
      });
      let rev = source.head;
      rev.author.id.should.equal(user.id);
      rev.blob.text.should.equal(DESC);
      rev.source_id.should.equal(sourceId);
      should.not.exist(rev.ary);
      should.not.exist(rev.prev_rev_id);
    });

    it('happy case with ary', async function () {
      let sourceId = await Source.makeNew(user, URL, DESC, ARY);
      let source = await Source.findById(sourceId, {
        include: { all: true, nested: true },
      });
      let rev = source.head;
      rev.author.id.should.equal(user.id);
      rev.blob.text.should.equal(DESC);
      rev.source_id.should.equal(sourceId);
      rev.ary.should.equal(ARY);
    });
  });

  describe('.tryUpdate()', function () {
    it('change', async function () {
      let sourceId = await Source.makeNew(user, URL, DESC);
      let source = await Source.findById(sourceId, {
        include: { all: true, nested: true },
      });
      let firstRev = source.head_id;
      await source.tryUpdate(user, URL2, DESC);

      source = await Source.findById(sourceId, {
        include: { all: true, nested: true },
      });
      source.head.url.should.equal(URL2);
      source.head.prev_rev_id.should.equal(firstRev);
    });

    it('no change', async function () {
      let sourceId = await Source.makeNew(user, URL, DESC);
      let source = await Source.findById(sourceId, {
        include: { all: true, nested: true },
      });
      let firstRev = source.head_id;
      await source.tryUpdate(user, URL, DESC);
      source.head_id.should.equal(firstRev);
    });
  });
});
