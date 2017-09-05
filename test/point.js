import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Point, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

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

  describe('.makeNew()', function () {
    it('basic', async function () {
      let pointRev = await Point.makeNew(user, {
        text: FOO,
      });
      pointRev.author.id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.prev_rev_id, null);
    });

    it('with for subpoint', async function () {
      let pointRev = await Point.makeNew(user, {
        text: FOO,
        points: [[{ text: BAR }], []],
      });
      pointRev.author.id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.prev_rev_id, null);

      pointRev.subpointRevs.length.should.equal(1);
      let subpointRev = pointRev.subpointRevs[0];
      subpointRev.author.id.should.equal(user.id);
      subpointRev.blob.text.should.equal(BAR);
      subpointRev.pointPoint.isFor.should.be.true;
    });

    it('with against subpoint', async function () {
      let pointRev = await Point.makeNew(user, {
        text: FOO,
        points: [[], [{ text: BAR }]],
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
  });
});
