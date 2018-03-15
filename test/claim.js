import chai from 'chai';

import { Claim, ClaimRev, Point } from '../models';
import { Flag } from '../common/flag';
import { NotFoundError } from '../api/error';
import { FOO, BAR, BAZ, registerAndVerifyUser } from './utils';

const expect = chai.expect;

const DELETE_MSG = 'Violates guidelines.';

describe('Claim', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('text only', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      await claimRev.reload(ClaimRev.INCLUDE(1));
      expect(claimRev.userId).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parentId).to.be.null;
      expect(claimRev.claimId).to.exist;
      expect(claimRev.flag).to.be.null;

      let claim = await Claim.findById(claimRev.claimId);
      expect(claim.headId).to.equal(claimRev.id);
    });

    it('with flag', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
        points: [[], []],
      });
      await claimRev.reload(ClaimRev.INCLUDE(1));
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.flag).to.equal(Flag.AD_HOMINEM);
    });

    it('with point for', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[], []],
        }], []],
      });
      await claimRev.reload(ClaimRev.INCLUDE(2));
      expect(claimRev.userId).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parentId).to.be.null;
      expect(claimRev.claimId).to.exist;

      expect(claimRev.pointRevs).to.have.lengthOf(1);
      let pointRev = claimRev.pointRevs[0];
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.claim.head.blob.text).to.equal(BAR);
      expect(pointRev.claimPoint.isFor).to.be.true;

      let point = await Point.findById(pointRev.pointId);
      expect(point.headId).to.equal(pointRev.id);
    });

    it('with point against', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], [{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[], []],
        }]],
      });
      await claimRev.reload(ClaimRev.INCLUDE(2));
      expect(claimRev.userId).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parentId).to.be.null;

      expect(claimRev.pointRevs).to.have.lengthOf(1);
      let pointRev = claimRev.pointRevs[0];
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.claim.head.blob.text).to.equal(BAR);
      expect(pointRev.claimPoint.isFor).to.be.false;
    });
  });

  describe('.apiUpdate()', function () {
    it('change text', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: BAR,
        points: [[], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.userId).to.equal(user.id);
      expect(r2.claimId).to.equal(r1.claimId);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.pointRevs).to.have.lengthOf(0);

      claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r2.id);
    });

    it('add point', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: FOO,
        points: [[{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[], []],
        }], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.userId).to.equal(user.id);
      expect(r2a.pointId).to.not.equal(r2.pointId);
      expect(r2a.claim.head.blob.text).to.equal(BAR);
      expect(r2a.parentId).to.be.null;
    });
  });

  describe('.apiDelete()', function () {
    it('happy', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.deleted).to.be.true;
      expect(r2.deleteMessage).to.equal(DELETE_MSG);
      expect(r2.userId).to.equal(user.id);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.blobHash).to.be.null;
      expect(r2.pointRevs).to.have.lengthOf(0);

      await claim.reload();
      expect(claim.headId).to.equal(r2.id);
    });

    it('no-op', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
      await claim.reload();
      expect(claim.headId).to.equal(r2.id);

      let r3 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
      expect(r3.id).to.equal(r2.id);
      expect(r3.parentId).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function () {
    it('no points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
        points: [[], []],
      });
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            flag: Flag.AD_HOMINEM,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{}, {}],
          },
        },
        sources: {},
      });
    });

    it('starred', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      await Claim.apiToggleStar(rev.claimId, user);
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 1,
              starred: true,
            },
            commentCount: 0,
            points: [{}, {}],
          },
        },
        sources: {},
      });
      let claimDataNoUser = await Claim.apiGet(rev.claimId);
      expect(claimDataNoUser).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 1,
              starred: false,
            },
            commentCount: 0,
            points: [{}, {}],
          },
        },
        sources: {},
      });
    });

    it('two points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[], []],
        }], [{
          type: Point.NEW_CLAIM,
          text: BAZ,
          points: [[], []],
        }]],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.pointRevs).to.have.lengthOf(2);
      let p1 = rev.pointRevs[rev.pointRevs[0].claimPoint.isFor ? 0 : 1];
      let p2 = rev.pointRevs[rev.pointRevs[0].claimPoint.isFor ? 1 : 0];
      await Point.apiToggleStar(p2.pointId, user);
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p1.pointId]: {
                id: p1.pointId,
                revId: p1.id,
                type: Point.CLAIM,
                claimId: p1.claimId,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {
              [p2.pointId]: {
                id: p2.pointId,
                revId: p2.id,
                type: Point.CLAIM,
                claimId: p2.claimId,
                star: {
                  count: 1,
                  starred: true,
                },
                commentCount: 0,
              },
            }],
          },
          [p1.claimId]: {
            id: p1.claimId,
            revId: p1.claim.headId,
            text: BAR,
            points: [{}, {}],
            depth: 2,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
          [p2.claimId]: {
            id: p2.claimId,
            revId: p2.claim.headId,
            text: BAZ,
            points: [{}, {}],
            depth: 2,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
        },
        sources: {},
      });
    });

    it('nested points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[{
            type: Point.NEW_CLAIM,
            text: BAZ,
            points: [[], []],
          }], []],
        }], []],
      });
      await rev.reload(ClaimRev.INCLUDE(3));
      expect(rev.pointRevs).to.have.lengthOf(1);
      let p1 = rev.pointRevs[0];
      expect(p1.claim.head.pointRevs).to.have.lengthOf(1);
      let p1a = p1.claim.head.pointRevs[0];

      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p1.pointId]: {
                id: p1.pointId,
                revId: p1.id,
                type: Point.CLAIM,
                claimId: p1.claimId,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {}],
          },
          [p1.claimId]: {
            id: p1.claimId,
            revId: p1.claim.headId,
            text: BAR,
            points: [{
              [p1a.pointId]: {
                id: p1a.pointId,
                revId: p1a.id,
                type: Point.CLAIM,
                claimId: p1a.claimId,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {}],
            depth: 2,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
          [p1a.claimId]: {
            id: p1a.claimId,
            revId: p1a.claim.headId,
            text: BAZ,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
        },
        sources: {},
      });
    });

    it('point to claim', async function () {
      let c1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.NEW_CLAIM,
          text: BAR,
          points: [[{
            type: Point.NEW_CLAIM,
            text: BAZ,
            points: [[], []],
          }], []],
        }], []],
      });
      await c1.reload(ClaimRev.INCLUDE(3));
      expect(c1.pointRevs).to.have.lengthOf(1);
      let p1 = c1.pointRevs[0];
      expect(p1.claim.head.pointRevs).to.have.lengthOf(1);
      let p1a = p1.claim.head.pointRevs[0];

      let claimId = c1.claimId;
      let pointId = p1.pointId;
      let subPointId = p1a.pointId;
      await expect(Point.getClaimId(pointId)).to.eventually.equal(claimId);
      await expect(Point.getClaimId(subPointId))
        .to.eventually.equal(p1.claimId);
    });

    it('bad ID', function () {
      return expect(Claim.apiGet('bad id')).to.be.rejected;
    });

    it('deleted', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let r2 = await Claim.apiDelete(r1.claimId, user, DELETE_MSG);
      let claimData = await Claim.apiGet(r1.claimId);
      expect(claimData).to.deep.equal({
        claims: {
          [r2.claimId]: {
            id: r2.claimId,
            revId: r2.id,
            depth: 3,
            deleted: true,
            deleteMessage: DELETE_MSG,
            commentCount: 0,
            star: {
              count: 0,
              starred: false,
            },
          },
        },
        sources: {},
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two claims', async function () {
      let c1r = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let c2r = await Claim.apiCreate(user, {
        text: BAR,
        points: [[], []],
      });
      await Claim.apiToggleStar(c2r.claimId, user);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            id: c1r.claimId,
            revId: c1r.id,
            text: FOO,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
          [c2r.claimId]: {
            id: c2r.claimId,
            revId: c2r.id,
            text: BAR,
            depth: 1,
            star: {
              count: 1,
              starred: true,
            },
            commentCount: 0,
          },
        },
        sources: {},
      });
    });

    it('excludes deleted', async function () {
      let c1r = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let c2r = await Claim.apiCreate(user, {
        text: BAR,
        points: [[], []],
      });
      await Claim.apiDelete(c2r.claimId, user, DELETE_MSG);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            id: c1r.claimId,
            revId: c1r.id,
            text: FOO,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
        },
        sources: {},
      });
    });
  });

  describe('apiGetRevs', function () {
    it('change text', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      await r1.reload(ClaimRev.INCLUDE(2));
      let claimId = r1.claimId;

      let r2 = await Claim.apiUpdate(claimId, user, {
        text: BAR,
        points: [[], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));

      let data = await Claim.apiGetRevs(claimId);
      expect(data).to.deep.equal({
        claimRevs: [{
          id: claimId,
          revId: r2.id,
          username: user.username,
          createdAt: r2.created_at,
          text: BAR,
          points: [{}, {}],
        }, {
          id: claimId,
          revId: r1.id,
          username: user.username,
          createdAt: r1.created_at,
          text: FOO,
          points: [{}, {}],
        }],
        pointRevs: {},
      });
    });

    it('bad id', async function () {
      await expect(Claim.apiGetRevs('bad id')).to.be.rejectedWith(
          NotFoundError);
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], []],
      });
      let star = await Claim.apiToggleStar(rev.claimId, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Claim.apiToggleStar(rev.claimId, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });
});
