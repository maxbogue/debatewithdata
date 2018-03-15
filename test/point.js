import chai from 'chai';

import { Claim, Point, PointRev, Source } from '../models';
import { PointType } from '../common/constants';
import { TestClaim, registerAndVerifyUser } from './utils';

const expect = chai.expect;

const URL = 'https://debatewithdata.org';

describe('Point', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
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
            id: sourceRev.sourceId,
            revId: sourceRev.id,
            url: URL,
            text: sourceText,
            type: 'misc',
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        id: pointRev.pointId,
        revId: pointRev.id,
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
      let claimRev = await TestClaim.create(user);
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
            ...TestClaim.verify(claimRev, false),
            depth: 1,
          },
        },
      });
      expect(pointData).to.deep.equal({
        id: pointRev.pointId,
        revId: pointRev.id,
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
        type: PointType.NEW_SOURCE,
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
            id: source.id,
            revId: source.headId,
            url: URL,
            text: sourceText,
            type: 'misc',
            commentCount: 0,
          },
        },
      });
      expect(pointData).to.deep.equal({
        id: pointRev.pointId,
        revId: pointRev.id,
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
        type: PointType.NEW_CLAIM,
        text,
        points: [[], []],
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
            id: claim.id,
            revId: claim.headId,
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
        id: pointRev.pointId,
        revId: pointRev.id,
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

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let claimRev = await TestClaim.create(user);
      let pointRev = await Point.apiCreate(user, {
        type: Point.CLAIM,
        claimId: claimRev.claimId,
      });
      let pointId = pointRev.pointId;

      let star = await Point.apiToggleStar(pointId, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Point.apiToggleStar(pointId, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });
});
