import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Point, Source, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

const URL = 'https://debatewithdata.org';
const DESC = 'awesome website';

const FOO = 'foo';
const BAR = 'bar';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

describe('Point', function () {
  let user;

  beforeEach(async function () {
    await sequelize.sync({ force: true });
    user = await User.register(USERNAME, PASSWORD, EMAIL);
  });

  describe('.apiCreate()', function () {
    it('text', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: 'text',
        text: FOO,
      });
      pointRev.author.id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.prev_rev_id, null);
    });

    it('subclaim with for subpoint', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: 'subclaim',
        text: FOO,
        points: [[{
          type: 'text',
          text: BAR,
        }], []],
      });
      pointRev.author_id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.prev_rev_id, null);

      pointRev.subpointRevs.length.should.equal(1);
      let subpointRev = pointRev.subpointRevs[0];
      subpointRev.author.id.should.equal(user.id);
      subpointRev.blob.text.should.equal(BAR);
      subpointRev.pointPoint.isFor.should.be.true;
    });

    it('subclaim with against subpoint', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: 'subclaim',
        text: FOO,
        points: [[], [{
          type: 'text',
          text: BAR,
        }]],
      });
      pointRev.author.id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.prev_rev_id, null);

      pointRev.subpointRevs.length.should.equal(1);
      let subpointRev = pointRev.subpointRevs[0];
      subpointRev.author.id.should.equal(user.id);
      subpointRev.blob.text.should.equal(BAR);
      subpointRev.pointPoint.isFor.should.be.false;
    });

    it('source link', async function () {
      let sourceId = await Source.makeNew(user, URL, DESC);
      let pointRev = await Point.apiCreate(user, {
        type: 'source',
        sourceId,
      });
      pointRev.author_id.should.equal(user.id);
      pointRev.source_id.should.equal(sourceId);
      should.equal(pointRev.prev_rev_id, null);
    });

  });
});
