import chai from 'chai';

import { sequelize, Point, Source, User } from '../models';

const expect = chai.expect;

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
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.blob.text).to.equal(FOO);
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.point_id).to.exist;

      let point = await Point.findById(pointRev.point_id);
      expect(point.head_id).to.equal(pointRev.id);
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
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.blob.text).to.equal(FOO);
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.point_id).to.exist;

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.user_id).to.equal(user.id);
      expect(subpointRev.blob.text).to.equal(BAR);
      expect(subpointRev.pointPoint.isFor).to.be.true;
      expect(subpointRev.point_id).to.not.equal(pointRev.point_id);
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
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.blob.text).to.equal(FOO);
      expect(pointRev.parent_id).to.be.null;

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.user_id).to.equal(user.id);
      expect(subpointRev.blob.text).to.equal(BAR);
      expect(subpointRev.pointPoint.isFor).to.be.false;
    });

    it('source link', async function () {
      let sourceRev = await Source.apiCreate(user, { url: URL, text: FOO });
      let pointRev = await Point.apiCreate(user, {
        type: 'source',
        sourceId: sourceRev.source_id,
      });
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.source_id).to.equal(sourceRev.source_id);
      expect(pointRev.parent_id).to.be.null;
    });
  });

  describe('.apiUpdate()', function () {
    it('text -> subclaim w/ sp -> same sp -> diff sp', async function () {
      let r1 = await Point.apiCreate(user, {
        type: 'text',
        text: FOO,
      });

      let point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r1.id);

      let r2 = await Point.apiUpdate(r1.point_id, user, {
        type: 'subclaim',
        text: BAR,
        points: [[{
          type: 'text',
          text: FOO,
        }], []],
      });
      await r2.reload(Point.INCLUDE_SUBPOINTS);
      expect(r2.user_id).to.equal(user.id);
      expect(r2.point_id).to.equal(r1.point_id);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.parent_id).to.equal(r1.id);
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.user_id).to.equal(user.id);
      expect(r2a.point_id).to.not.equal(r2.point_id);
      expect(r2a.blob.text).to.equal(FOO);
      expect(r2a.parent_id).to.be.null;

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r2.id);

      let r3 = await Point.apiUpdate(r1.point_id, user, {
        type: 'subclaim',
        text: BAZ,
        points: [[{
          id: r2a.point_id,
          rev: r2a.id,
        }], []],
      });
      await r3.reload(Point.INCLUDE_SUBPOINTS);
      expect(r3.user_id).to.equal(user.id);
      expect(r3.point_id).to.equal(r1.point_id);
      expect(r3.blob.text).to.equal(BAZ);
      expect(r3.parent_id).to.equal(r2.id);
      expect(r3.pointRevs).to.have.lengthOf(1);
      let r3a = r3.pointRevs[0];
      expect(r3a.id).to.equal(r2a.id);

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r3.id);

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
      expect(r4.user_id).to.equal(user.id);
      expect(r4.point_id).to.equal(r1.point_id);
      expect(r4.blob.text).to.equal(BAZ);
      expect(r4.parent_id).to.equal(r3.id);
      expect(r4.pointRevs).to.have.lengthOf(1);
      let r4a = r4.pointRevs[0];
      expect(r4a.user_id).to.equal(user.id);
      expect(r4a.point_id).to.equal(r2a.point_id);
      expect(r4a.blob.text).to.equal(BAR);
      expect(r4a.parent_id).to.equal(r2a.id);

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r4.id);
    });
  });
});
