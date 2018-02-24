import chai from 'chai';

import { Claim, Point, PointRev, Source } from '../models';
import { Flag } from '../common/flag';
import { FOO, BAR, BAZ, registerAndVerifyUser } from './utils';

const expect = chai.expect;

const URL = 'https://debatewithdata.org';

describe('Point', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('text', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.pointId).to.exist;
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.TEXT);
      expect(pointRev.blob.text).to.equal(FOO);
      expect(pointRev.flag).to.be.null;

      let point = await Point.findById(pointRev.pointId);
      expect(point.headId).to.equal(pointRev.id);
    });

    it('text with flag', async function () {
      let pointRev = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
        flag: Flag.AD_HOMINEM,
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.blob.text).to.equal(FOO);
      expect(pointRev.flag).to.equal(Flag.AD_HOMINEM);
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
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.pointId).to.exist;
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.SUBCLAIM);
      expect(pointRev.blob.text).to.equal(FOO);

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.userId).to.equal(user.id);
      expect(subpointRev.pointId).to.not.equal(pointRev.pointId);
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
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.blob.text).to.equal(FOO);

      expect(pointRev.pointRevs).to.have.lengthOf(1);
      let subpointRev = pointRev.pointRevs[0];
      expect(subpointRev.userId).to.equal(user.id);
      expect(subpointRev.blob.text).to.equal(BAR);
      expect(subpointRev.pointPoint.isFor).to.be.false;
    });

    it('source link', async function () {
      let sourceText = 'must be long enough';
      let sourceRev = await Source.apiCreate(user, {
        url: URL,
        text: sourceText,
        type: 'misc',
      });
      let pointRev = await Point.apiCreate(user, {
        type: Point.SOURCE,
        sourceId: sourceRev.sourceId,
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.SOURCE);
      expect(pointRev.sourceId).to.equal(sourceRev.sourceId);

      let data = { sources: {} };
      let pointData = await pointRev.toData(data, 1, null);
      expect(data).to.deep.equal({
        sources: {
          [sourceRev.sourceId]: {
            rev: sourceRev.id,
            url: URL,
            text: sourceText,
            type: 'misc',
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        rev: pointRev.id,
        type: Point.SOURCE,
        sourceId: sourceRev.sourceId,
        star: {
          count: 0,
          starred: false,
        },
        commentCount: 0,
      });
    });

    it('claim link', async function () {
      let text = 'must be long enough';
      let claimRev = await Claim.apiCreate(user, { text, points: [[], []] });
      let pointRev = await Point.apiCreate(user, {
        type: Point.CLAIM,
        claimId: claimRev.claimId,
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.CLAIM);
      expect(pointRev.claimId).to.equal(claimRev.claimId);

      let data = { claims: {} };
      let pointData = await pointRev.toData(data, 1, null);
      expect(data).to.deep.equal({
        claims: {
          [claimRev.claimId]: {
            rev: claimRev.id,
            text: text,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        rev: pointRev.id,
        type: Point.CLAIM,
        claimId: claimRev.claimId,
        star: {
          count: 0,
          starred: false,
        },
        commentCount: 0,
      });
    });

    it('new source', async function () {
      let sourceText = 'must be long enough';
      let pointRev = await Point.apiCreate(user, {
        type: 'newSource',
        source: {
          url: URL,
          text: sourceText,
          type: 'misc',
        },
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.SOURCE);
      expect(pointRev.sourceId).to.have.lengthOf(12);

      let source = await Source.findById(pointRev.sourceId);

      let data = { sources: {} };
      let pointData = await pointRev.toData(data, 1, null);
      expect(data).to.deep.equal({
        sources: {
          [source.id]: {
            rev: source.headId,
            url: URL,
            text: sourceText,
            type: 'misc',
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        rev: pointRev.id,
        type: Point.SOURCE,
        sourceId: source.id,
        star: {
          count: 0,
          starred: false,
        },
        commentCount: 0,
      });
    });

    it('new claim', async function () {
      let text = 'must be long enough';
      let pointRev = await Point.apiCreate(user, {
        type: 'newClaim',
        claim: { text, points: [[], []] },
      });
      await pointRev.reload(PointRev.INCLUDE(1));
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.parentId).to.be.null;
      expect(pointRev.type).to.equal(Point.CLAIM);
      expect(pointRev.claimId).to.have.lengthOf(12);

      let claim = await Claim.findById(pointRev.claimId);

      let data = { claims: {} };
      let pointData = await pointRev.toData(data, 1, null);
      expect(data).to.deep.equal({
        claims: {
          [claim.id]: {
            rev: claim.headId,
            text: text,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        rev: pointRev.id,
        type: Point.CLAIM,
        claimId: claim.id,
        star: {
          count: 0,
          starred: false,
        },
        commentCount: 0,
      });
    });
  });

  describe('.apiUpdate()', function () {
    it('text -> subclaim w/ sp -> same sp -> diff sp', async function () {
      let r1 = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });

      let point = await Point.findById(r1.pointId);
      expect(point.headId).to.equal(r1.id);

      let r2 = await Point.apiUpdate(r1.pointId, user, {
        type: Point.SUBCLAIM,
        text: BAR,
        points: [[{
          type: Point.TEXT,
          text: FOO,
        }], []],
      });
      await r2.reload(PointRev.INCLUDE(2));
      expect(r2.userId).to.equal(user.id);
      expect(r2.pointId).to.equal(r1.pointId);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.type).to.equal(Point.SUBCLAIM);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.userId).to.equal(user.id);
      expect(r2a.pointId).to.not.equal(r2.pointId);
      expect(r2a.parentId).to.be.null;
      expect(r2a.type).to.equal(Point.TEXT);
      expect(r2a.blob.text).to.equal(FOO);

      point = await Point.findById(r1.pointId);
      expect(point.headId).to.equal(r2.id);

      let r3 = await Point.apiUpdate(r1.pointId, user, {
        type: Point.SUBCLAIM,
        text: BAZ,
        points: [[{
          id: r2a.pointId,
          rev: r2a.id,
          type: Point.TEXT,
          text: FOO,
        }], []],
      });
      await r3.reload(PointRev.INCLUDE(2));
      expect(r3.userId).to.equal(user.id);
      expect(r3.pointId).to.equal(r1.pointId);
      expect(r3.parentId).to.equal(r2.id);
      expect(r3.blob.text).to.equal(BAZ);
      expect(r3.pointRevs).to.have.lengthOf(1);
      let r3a = r3.pointRevs[0];
      expect(r3a.id).to.equal(r2a.id);

      point = await Point.findById(r1.pointId);
      expect(point.headId).to.equal(r3.id);

      let r4 = await Point.apiUpdate(r1.pointId, user, {
        type: Point.SUBCLAIM,
        text: BAZ,
        points: [[{
          id: r3a.pointId,
          type: Point.TEXT,
          text: BAR,
        }], []],
      });
      await r4.reload(PointRev.INCLUDE(2));
      expect(r4.userId).to.equal(user.id);
      expect(r4.pointId).to.equal(r1.pointId);
      expect(r4.parentId).to.equal(r3.id);
      expect(r4.blob.text).to.equal(BAZ);
      expect(r4.pointRevs).to.have.lengthOf(1);
      let r4a = r4.pointRevs[0];
      expect(r4a.userId).to.equal(user.id);
      expect(r4a.pointId).to.equal(r2a.pointId);
      expect(r4a.parentId).to.equal(r2a.id);
      expect(r4a.blob.text).to.equal(BAR);

      point = await Point.findById(r1.pointId);
      expect(point.headId).to.equal(r4.id);
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let rev = await Point.apiCreate(user, {
        type: Point.TEXT,
        text: FOO,
      });
      let star = await Point.apiToggleStar(rev.pointId, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Point.apiToggleStar(rev.pointId, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });
});
