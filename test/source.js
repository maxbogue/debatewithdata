import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Source, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

const URL = 'https://debatewithdata.org';
const DESC = 'an awesome website';
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
});
