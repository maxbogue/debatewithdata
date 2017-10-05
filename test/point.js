import chai from 'chai';

import { Point, PointRev, Source } from '../models';
import utils from './utils';

const expect = chai.expect;

const URL = 'https://debatewithdata.org';

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

describe('Point', function () {
  let user;

  beforeEach(async function () {
    user = await utils.createUser();
  });

  describe('.apiCreate()', function () {
    it(Point.TEXT, async function () {
      let pointRev = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.point_id).to.exist;
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.type).to.equal(Point.TEXT);
      expect(pointRev.blob.text).to.equal(FOO);

      let point = await Point.findById(pointRev.point_id);
      expect(point.head_id).to.equal(pointRev.id);
    });

    it('subclaim with for subpoint', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: Point.SUBCLAIM,
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: BAR,
        }], []],
      });
      await pointRev.reload(PointRev.INCLUDE(2));
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.point_id).to.exist;
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.type).to.equal(Point.SUBCLAIM);
      expect(pointRev.blob.text).to.equal(FOO);

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.user_id).to.equal(user.id);
      expect(subpointRev.point_id).to.not.equal(pointRev.point_id);
      expect(subpointRev.type).to.equal(Point.TEXT);
      expect(subpointRev.blob.text).to.equal(BAR);
      expect(subpointRev.pointPoint.isFor).to.be.true;
    });

    it('subclaim with against subpoint', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: Point.SUBCLAIM,
        text: FOO,
        points: [[], [{
          type: Point.TEXT,
          text: BAR,
        }]],
      });
      await pointRev.reload(PointRev.INCLUDE(2));
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.blob.text).to.equal(FOO);

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.user_id).to.equal(user.id);
      expect(subpointRev.blob.text).to.equal(BAR);
      expect(subpointRev.pointPoint.isFor).to.be.false;
    });

    it('source link', async function () {
      let sourceRev = await Source.apiCreate(user, { url: URL, text: FOO });
      let pointRev = await Point.apiCreate(user, {
        type: Point.SOURCE,
        sourceId: sourceRev.source_id,
      });
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.parent_id).to.be.null;
      expect(pointRev.type).to.equal(Point.SOURCE);
      expect(pointRev.source_id).to.equal(sourceRev.source_id);
    });
  });

  describe('.apiUpdate()', function () {
    it('text -> subclaim w/ sp -> same sp -> diff sp', async function () {
      let r1 = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });

      let point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r1.id);

      let r2 = await Point.apiUpdate(r1.point_id, user, {
        type: Point.SUBCLAIM,
        text: BAR,
        points: [[{
          type: Point.TEXT,
          text: FOO,
        }], []],
      });
      await r2.reload(PointRev.INCLUDE(2));
      expect(r2.user_id).to.equal(user.id);
      expect(r2.point_id).to.equal(r1.point_id);
      expect(r2.parent_id).to.equal(r1.id);
      expect(r2.type).to.equal(Point.SUBCLAIM);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.user_id).to.equal(user.id);
      expect(r2a.point_id).to.not.equal(r2.point_id);
      expect(r2a.parent_id).to.be.null;
      expect(r2a.type).to.equal(Point.TEXT);
      expect(r2a.blob.text).to.equal(FOO);

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r2.id);

      let r3 = await Point.apiUpdate(r1.point_id, user, {
        type: Point.SUBCLAIM,
        text: BAZ,
        points: [[{
          id: r2a.point_id,
          rev: r2a.id,
        }], []],
      });
      await r3.reload(PointRev.INCLUDE(2));
      expect(r3.user_id).to.equal(user.id);
      expect(r3.point_id).to.equal(r1.point_id);
      expect(r3.parent_id).to.equal(r2.id);
      expect(r3.blob.text).to.equal(BAZ);
      expect(r3.pointRevs).to.have.lengthOf(1);
      let r3a = r3.pointRevs[0];
      expect(r3a.id).to.equal(r2a.id);

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r3.id);

      let r4 = await Point.apiUpdate(r1.point_id, user, {
        type: Point.SUBCLAIM,
        text: BAZ,
        points: [[{
          id: r3a.point_id,
          type: Point.TEXT,
          text: BAR,
        }], []],
      });
      await r4.reload(PointRev.INCLUDE(2));
      expect(r4.user_id).to.equal(user.id);
      expect(r4.point_id).to.equal(r1.point_id);
      expect(r4.parent_id).to.equal(r3.id);
      expect(r4.blob.text).to.equal(BAZ);
      expect(r4.pointRevs).to.have.lengthOf(1);
      let r4a = r4.pointRevs[0];
      expect(r4a.user_id).to.equal(user.id);
      expect(r4a.point_id).to.equal(r2a.point_id);
      expect(r4a.parent_id).to.equal(r2a.id);
      expect(r4a.blob.text).to.equal(BAR);

      point = await Point.findById(r1.point_id);
      expect(point.head_id).to.equal(r4.id);
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let rev = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });
      let star = await Point.apiToggleStar(rev.point_id, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Point.apiToggleStar(rev.point_id, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });
});
