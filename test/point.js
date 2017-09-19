import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { sequelize, Point, Source, User } from '../models';

chai.use(chaiAsPromised);
const should = chai.should();

const URL = 'https://debatewithdata.org';

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

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
      await pointRev.reload(Point.INCLUDE_SUBPOINTS);
      pointRev.user_id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.parent_id, null);
      pointRev.point_id.should.exist;

      let point = await Point.findById(pointRev.point_id);
      point.head_id.should.equal(pointRev.id);
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
      await pointRev.reload(Point.INCLUDE_SUBPOINTS);
      pointRev.user_id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.parent_id, null);
      pointRev.point_id.should.exist;

      pointRev.subpointRevs.length.should.equal(1);
      let subpointRev = pointRev.subpointRevs[0];
      subpointRev.user_id.should.equal(user.id);
      subpointRev.blob.text.should.equal(BAR);
      subpointRev.pointPoint.isFor.should.be.true;
      subpointRev.point_id.should.not.equal(pointRev.point_id);
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
      await pointRev.reload(Point.INCLUDE_SUBPOINTS);
      pointRev.user_id.should.equal(user.id);
      pointRev.blob.text.should.equal(FOO);
      should.equal(pointRev.parent_id, null);

      pointRev.subpointRevs.length.should.equal(1);
      let subpointRev = pointRev.subpointRevs[0];
      subpointRev.user_id.should.equal(user.id);
      subpointRev.blob.text.should.equal(BAR);
      subpointRev.pointPoint.isFor.should.be.false;
    });

    it('source link', async function () {
      let sourceRev = await Source.apiCreate(user, { url: URL, text: FOO });
      let pointRev = await Point.apiCreate(user, {
        type: 'source',
        sourceId: sourceRev.source_id,
      });
      pointRev.user_id.should.equal(user.id);
      pointRev.source_id.should.equal(sourceRev.source_id);
      should.equal(pointRev.parent_id, null);
    });
  });

  describe('.apiUpdate()', function () {
    it('text -> subclaim w/ sp -> same sp -> diff sp', async function () {
      let r1 = await Point.apiCreate(user, {
        type: 'text',
        text: FOO,
      });

      let point = await Point.findById(r1.point_id);
      point.head_id.should.equal(r1.id);

      let r2 = await Point.apiUpdate(r1.point_id, user, {
        type: 'subclaim',
        text: BAR,
        points: [[{
          type: 'text',
          text: FOO,
        }], []],
      });
      await r2.reload(Point.INCLUDE_SUBPOINTS);
      r2.user_id.should.equal(user.id);
      r2.point_id.should.equal(r1.point_id);
      r2.blob.text.should.equal(BAR);
      r2.parent_id.should.equal(r1.id);
      r2.subpointRevs.length.should.equal(1);
      let r2a = r2.subpointRevs[0];
      r2a.user_id.should.equal(user.id);
      r2a.point_id.should.not.equal(r2.point_id);
      r2a.blob.text.should.equal(FOO);
      should.equal(r2a.parent_id, null);

      point = await Point.findById(r1.point_id);
      point.head_id.should.equal(r2.id);

      let r3 = await Point.apiUpdate(r1.point_id, user, {
        type: 'subclaim',
        text: BAZ,
        points: [[{
          id: r2a.point_id,
          rev: r2a.id,
        }], []],
      });
      await r3.reload(Point.INCLUDE_SUBPOINTS);
      r3.user_id.should.equal(user.id);
      r3.point_id.should.equal(r1.point_id);
      r3.blob.text.should.equal(BAZ);
      r3.parent_id.should.equal(r2.id);
      r3.subpointRevs.length.should.equal(1);
      let r3a = r3.subpointRevs[0];
      r3a.id.should.equal(r2a.id);

      point = await Point.findById(r1.point_id);
      point.head_id.should.equal(r3.id);

      let r4 = await Point.apiUpdate(r1.point_id, user, {
        type: 'subclaim',
        text: BAZ,
        points: [[{
          id: r3a.point_id,
          type: 'text',
          text: BAR,
        }], []],
      });
      await r4.reload(Point.INCLUDE_SUBPOINTS);
      r4.user_id.should.equal(user.id);
      r4.point_id.should.equal(r1.point_id);
      r4.blob.text.should.equal(BAZ);
      r4.parent_id.should.equal(r3.id);
      r4.subpointRevs.length.should.equal(1);
      let r4a = r4.subpointRevs[0];
      r4a.user_id.should.equal(user.id);
      r4a.point_id.should.equal(r2a.point_id);
      r4a.blob.text.should.equal(BAR);
      r4a.parent_id.should.equal(r2a.id);

      point = await Point.findById(r1.point_id);
      point.head_id.should.equal(r4.id);
    });
  });
});
