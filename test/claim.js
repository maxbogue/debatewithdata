import chai from 'chai';

import { Claim, ClaimRev, Point } from '../models';
import { Flag } from '../common/flag';
import { registerAndVerifyUser } from './utils';

const expect = chai.expect;

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

describe('Claim', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('text only', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
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
      });
      await claimRev.reload(ClaimRev.INCLUDE(1));
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.flag).to.equal(Flag.AD_HOMINEM);
    });

    it('with point for', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: BAR,
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
      expect(pointRev.blob.text).to.equal(BAR);
      expect(pointRev.claimPoint.isFor).to.be.true;
    });

    it('with point against', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[], [{
          type: Point.TEXT,
          text: BAR,
        }]],
      });
      await claimRev.reload(ClaimRev.INCLUDE(2));
      expect(claimRev.userId).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parentId).to.be.null;

      expect(claimRev.pointRevs).to.have.lengthOf(1);
      let pointRev = claimRev.pointRevs[0];
      expect(pointRev.userId).to.equal(user.id);
      expect(pointRev.blob.text).to.equal(BAR);
      expect(pointRev.claimPoint.isFor).to.be.false;
    });
  });

  describe('.apiUpdate()', function () {
    it('change text', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: BAR,
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
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: FOO,
        }], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.userId).to.equal(user.id);
      expect(r2a.pointId).to.not.equal(r2.pointId);
      expect(r2a.blob.text).to.equal(FOO);
      expect(r2a.parentId).to.be.null;
    });

    it('change point', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: BAR,
        }], []],
      });
      await r1.reload(ClaimRev.INCLUDE(2));
      expect(r1.pointRevs).to.have.lengthOf(1);
      let r1a = r1.pointRevs[0];

      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: FOO,
        points: [[{
          id: r1a.pointId,
          type: Point.TEXT,
          text: BAZ,
        }], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.blob.text).to.equal(BAZ);
      expect(r2a.parentId).to.equal(r1a.id);
    });
  });

  describe('.apiDelete()', function () {
    it('happy', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user);
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.deleted).to.be.true;
      expect(r2.userId).to.equal(user.id);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.blobHash).to.be.null;
      expect(r2.pointRevs).to.have.lengthOf(0);

      await claim.reload();
      expect(claim.headId).to.equal(r2.id);
    });

    it('no-op', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user);
      await claim.reload();
      expect(claim.headId).to.equal(r2.id);

      let r3 = await Claim.apiDelete(claim.id, user);
      expect(r3.id).to.equal(r2.id);
      expect(r3.parentId).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function () {
    it('no points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
      });
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            rev: rev.id,
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
      let rev = await Claim.apiCreate(user, { text: FOO });
      await Claim.apiToggleStar(rev.claimId, user);
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            rev: rev.id,
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
            rev: rev.id,
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
          type: Point.TEXT,
          text: BAR,
        }], [{
          type: Point.TEXT,
          text: BAZ,
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
            rev: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p1.pointId]: {
                rev: p1.id,
                type: Point.TEXT,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {
              [p2.pointId]: {
                rev: p2.id,
                type: Point.TEXT,
                text: BAZ,
                star: {
                  count: 1,
                  starred: true,
                },
                commentCount: 0,
              },
            }],
          },
        },
        sources: {},
      });
    });

    it('nested points', async function () {
      let c1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.SUBCLAIM,
          text: BAR,
          points: [[{
            type: Point.TEXT,
            text: BAZ,
          }], []],
        }], []],
      });
      await c1.reload(ClaimRev.INCLUDE(3));
      expect(c1.pointRevs).to.have.lengthOf(1);
      let p1 = c1.pointRevs[0];
      expect(p1.pointRevs).to.have.lengthOf(1);
      let p1a = p1.pointRevs[0];
      await Point.apiToggleStar(p1a.pointId, user);
      let c1Data = await Claim.apiGet(c1.claimId, user);
      expect(c1Data).to.deep.equal({
        claims: {
          [c1.claimId]: {
            rev: c1.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p1.pointId]: {
                rev: p1.id,
                type: Point.SUBCLAIM,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
                points: [{
                  [p1a.pointId]: {
                    rev: p1a.id,
                    type: Point.TEXT,
                    text: BAZ,
                    star: {
                      count: 1,
                      starred: true,
                    },
                    commentCount: 0,
                  },
                }, {}],
              },
            }, {}],
          },
        },
        sources: {},
      });

      let c2 = await Claim.apiCreate(user, {
        text: BAZ,
        points: [[{
          type: Point.CLAIM,
          claimId: c1.claimId,
        }], []],
      });

      await c2.reload(ClaimRev.INCLUDE(3));
      expect(c2.pointRevs).to.have.lengthOf(1);
      let p3 = c2.pointRevs[0];

      let c2Data = await Claim.apiGet(c2.claimId, user);
      expect(c2Data).to.deep.equal({
        claims: {
          [c2.claimId]: {
            rev: c2.id,
            text: BAZ,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p3.pointId]: {
                rev: p3.id,
                type: Point.CLAIM,
                claimId: c1.claimId,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {}],
          },
          [c1.claimId]: {
            rev: c1.id,
            text: FOO,
            depth: 2,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
            points: [{
              [p1.pointId]: {
                rev: p1.id,
                type: Point.SUBCLAIM,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
                commentCount: 0,
              },
            }, {}],
          },
        },
        sources: {},
      });
    });

    it('point to claim', async function () {
      let c1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.SUBCLAIM,
          text: BAR,
          points: [[{
            type: Point.TEXT,
            text: BAZ,
          }], []],
        }], []],
      });
      await c1.reload(ClaimRev.INCLUDE(3));
      expect(c1.pointRevs).to.have.lengthOf(1);
      let p1 = c1.pointRevs[0];
      expect(p1.pointRevs).to.have.lengthOf(1);
      let p1a = p1.pointRevs[0];

      let claimId = c1.claimId;
      let pointId = p1.pointId;
      let subPointId = p1a.pointId;
      await expect(Point.getClaimId(pointId)).to.eventually.equal(claimId);
      await expect(Point.getClaimId(subPointId)).to.eventually.equal(claimId);
    });

    it('bad ID', function () {
      return expect(Claim.apiGet('bad id')).to.be.rejected;
    });

    it('deleted', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let r2 = await Claim.apiDelete(r1.claimId, user);
      let claimData = await Claim.apiGet(r1.claimId);
      expect(claimData).to.deep.equal({
        claims: {
          [r1.claimId]: {
            rev: r2.id,
            depth: 3,
            deleted: true,
          },
        },
        sources: {},
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two claims', async function () {
      let c1r = await Claim.apiCreate(user, { text: FOO });
      let c2r = await Claim.apiCreate(user, { text: BAR });
      await Claim.apiToggleStar(c2r.claimId, user);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            rev: c1r.id,
            text: FOO,
            depth: 1,
            star: {
              count: 0,
              starred: false,
            },
            commentCount: 0,
          },
          [c2r.claimId]: {
            rev: c2r.id,
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
      let c1r = await Claim.apiCreate(user, { text: FOO });
      let c2r = await Claim.apiCreate(user, { text: BAR });
      await Claim.apiDelete(c2r.claimId, user);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            rev: c1r.id,
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

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
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
