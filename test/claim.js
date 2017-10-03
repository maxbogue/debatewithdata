import chai from 'chai';

import { sequelize, Claim, ClaimRev, Point } from '../models';
import utils from './utils';

const expect = chai.expect;

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

describe('Claim', function () {
  let user;

  beforeEach(async function () {
    await sequelize.sync({ force: true });
    user = await utils.createUser();
  });

  describe('.apiCreate()', function () {
    it('text only', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await claimRev.reload(ClaimRev.INCLUDE(1));
      expect(claimRev.user_id).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parent_id).to.be.null;
      expect(claimRev.claim_id).to.exist;

      let claim = await Claim.findById(claimRev.claim_id);
      expect(claim.head_id).to.equal(claimRev.id);
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
      expect(claimRev.user_id).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parent_id).to.be.null;
      expect(claimRev.claim_id).to.exist;

      expect(claimRev.pointRevs).to.have.lengthOf(1);
      let pointRev = claimRev.pointRevs[0];
      expect(pointRev.user_id).to.equal(user.id);
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
      expect(claimRev.user_id).to.equal(user.id);
      expect(claimRev.blob.text).to.equal(FOO);
      expect(claimRev.parent_id).to.be.null;

      expect(claimRev.pointRevs).to.have.lengthOf(1);
      let pointRev = claimRev.pointRevs[0];
      expect(pointRev.user_id).to.equal(user.id);
      expect(pointRev.blob.text).to.equal(BAR);
      expect(pointRev.claimPoint.isFor).to.be.false;
    });
  });

  describe('.apiUpdate()', function () {
    it('change text', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claim_id, user, {
        text: BAR,
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.user_id).to.equal(user.id);
      expect(r2.claim_id).to.equal(r1.claim_id);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.parent_id).to.equal(r1.id);
      expect(r2.pointRevs).to.have.lengthOf(0);

      claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r2.id);
    });

    it('add point', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claim_id, user, {
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: FOO,
        }], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.user_id).to.equal(user.id);
      expect(r2a.point_id).to.not.equal(r2.point_id);
      expect(r2a.blob.text).to.equal(FOO);
      expect(r2a.parent_id).to.be.null;
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

      let claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claim_id, user, {
        text: FOO,
        points: [[{
          id: r1a.point_id,
          type: Point.TEXT,
          text: BAZ,
        }], []],
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.pointRevs).to.have.lengthOf(1);
      let r2a = r2.pointRevs[0];
      expect(r2a.blob.text).to.equal(BAZ);
      expect(r2a.parent_id).to.equal(r1a.id);
    });
  });

  describe('.apiDelete()', function () {
    it('happy', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user);
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.deleted).to.be.true;
      expect(r2.user_id).to.equal(user.id);
      expect(r2.parent_id).to.equal(r1.id);
      expect(r2.blob_hash).to.be.null;
      expect(r2.pointRevs).to.have.lengthOf(0);

      await claim.reload();
      expect(claim.head_id).to.equal(r2.id);
    });

    it('no-op', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let claim = await Claim.findById(r1.claim_id);
      expect(claim.head_id).to.equal(r1.id);

      let r2 = await Claim.apiDelete(claim.id, user);
      await claim.reload();
      expect(claim.head_id).to.equal(r2.id);

      let r3 = await Claim.apiDelete(claim.id, user);
      expect(r3.id).to.equal(r2.id);
      expect(r3.parent_id).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function () {
    it('no points', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
      let claimData = await Claim.apiGet(rev.claim_id, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claim_id]: {
            rev: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{}, {}],
          },
        },
        sources: {},
      });
    });

    it('starred', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
      await Claim.apiToggleStar(rev.claim_id, user);
      let claimData = await Claim.apiGet(rev.claim_id, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claim_id]: {
            rev: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 1,
              starred: true,
            },
            points: [{}, {}],
          },
        },
        sources: {},
      });
      let claimDataNoUser = await Claim.apiGet(rev.claim_id);
      expect(claimDataNoUser).to.deep.equal({
        claims: {
          [rev.claim_id]: {
            rev: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 1,
              starred: false,
            },
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
      await Point.apiToggleStar(p2.point_id, user);
      let claimData = await Claim.apiGet(rev.claim_id, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claim_id]: {
            rev: rev.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{
              [p1.point_id]: {
                rev: p1.id,
                type: Point.TEXT,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
              },
            }, {
              [p2.point_id]: {
                rev: p2.id,
                type: Point.TEXT,
                text: BAZ,
                star: {
                  count: 1,
                  starred: true,
                },
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
      await Point.apiToggleStar(p1a.point_id, user);
      let c1Data = await Claim.apiGet(c1.claim_id, user);
      expect(c1Data).to.deep.equal({
        claims: {
          [c1.claim_id]: {
            rev: c1.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{
              [p1.point_id]: {
                rev: p1.id,
                type: Point.SUBCLAIM,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
                points: [{
                  [p1a.point_id]: {
                    rev: p1a.id,
                    type: Point.TEXT,
                    text: BAZ,
                    star: {
                      count: 1,
                      starred: true,
                    },
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
          claimId: c1.claim_id,
        }], []],
      });

      await c2.reload(ClaimRev.INCLUDE(3));
      expect(c2.pointRevs).to.have.lengthOf(1);
      let p3 = c2.pointRevs[0];

      let c2Data = await Claim.apiGet(c2.claim_id, user);
      expect(c2Data).to.deep.equal({
        claims: {
          [c2.claim_id]: {
            rev: c2.id,
            text: BAZ,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{
              [p3.point_id]: {
                rev: p3.id,
                type: Point.CLAIM,
                claimId: c1.claim_id,
                star: {
                  count: 0,
                  starred: false,
                },
              },
            }, {}],
          },
          [c1.claim_id]: {
            rev: c1.id,
            text: FOO,
            depth: 2,
            star: {
              count: 0,
              starred: false,
            },
            points: [{
              [p1.point_id]: {
                rev: p1.id,
                type: Point.SUBCLAIM,
                text: BAR,
                star: {
                  count: 0,
                  starred: false,
                },
              },
            }, {}],
          },
        },
        sources: {},
      });
    });

    it('bad ID', function () {
      return expect(Claim.apiGet('bad id')).to.be.rejected;
    });

    it('deleted', async function () {
      let r1 = await Claim.apiCreate(user, { text: FOO });
      let r2 = await Claim.apiDelete(r1.claim_id, user);
      let claimData = await Claim.apiGet(r1.claim_id);
      expect(claimData).to.deep.equal({
        claims: {
          [r1.claim_id]: {
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
      await Claim.apiToggleStar(c2r.claim_id, user);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claim_id]: {
            rev: c1r.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{}, {}],
          },
          [c2r.claim_id]: {
            rev: c2r.id,
            text: BAR,
            depth: 3,
            star: {
              count: 1,
              starred: true,
            },
            points: [{}, {}],
          },
        },
        sources: {},
      });
    });

    it('excludes deleted', async function () {
      let c1r = await Claim.apiCreate(user, { text: FOO });
      let c2r = await Claim.apiCreate(user, { text: BAR });
      await Claim.apiDelete(c2r.claim_id, user);
      let claimsData = await Claim.apiGetAll(user);
      expect(claimsData).to.deep.equal({
        claims: {
          [c1r.claim_id]: {
            rev: c1r.id,
            text: FOO,
            depth: 3,
            star: {
              count: 0,
              starred: false,
            },
            points: [{}, {}],
          },
        },
        sources: {},
      });
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
      let star = await Claim.apiToggleStar(rev.claim_id, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Claim.apiToggleStar(rev.claim_id, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });

  describe('.apiGetStars()', function () {
    it('no user', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
      await Claim.apiToggleStar(rev.claim_id, user);
      let stars = await Claim.apiGetStars(rev.claim_id);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: false,
        },
        points: {},
      });
    });

    it('no points', async function () {
      let rev = await Claim.apiCreate(user, { text: FOO });
      await Claim.apiToggleStar(rev.claim_id, user);
      let stars = await Claim.apiGetStars(rev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: true,
        },
        points: {},
      });
    });

    it('one point', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.TEXT,
          text: BAR,
        }], []],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      let pointId = rev.pointRevs[0].point_id;

      await Claim.apiToggleStar(rev.claim_id, user);
      let stars = await Claim.apiGetStars(rev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: true,
        },
        points: {
          [pointId]: {
            count: 0,
            starred: false,
          },
        },
      });

      await Point.apiToggleStar(pointId, user);
      stars = await Claim.apiGetStars(rev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: true,
        },
        points: {
          [pointId]: {
            count: 1,
            starred: true,
          },
        },
      });
    });

    it('nested points', async function () {
      let rev = await Claim.apiCreate(user, {
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
      await rev.reload(ClaimRev.INCLUDE(3));
      let pointId = rev.pointRevs[0].point_id;
      let subPointId = rev.pointRevs[0].pointRevs[0].point_id;

      await Claim.apiToggleStar(rev.claim_id, user);
      let stars = await Claim.apiGetStars(rev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: true,
        },
        points: {
          [pointId]: {
            count: 0,
            starred: false,
          },
          [subPointId]: {
            count: 0,
            starred: false,
          },
        },
      });

      await Point.apiToggleStar(subPointId, user);
      stars = await Claim.apiGetStars(rev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 1,
          starred: true,
        },
        points: {
          [pointId]: {
            count: 0,
            starred: false,
          },
          [subPointId]: {
            count: 1,
            starred: true,
          },
        },
      });
    });

    it('nested claim', async function () {
      let innerRev = await Claim.apiCreate(user, {
        text: BAR,
        points: [[{
          type: Point.TEXT,
          text: BAZ,
        }], []],
      });
      let outerRev = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: Point.CLAIM,
          claimId: innerRev.claim_id,
        }], []],
      });
      await innerRev.reload(ClaimRev.INCLUDE(2));
      await outerRev.reload(ClaimRev.INCLUDE(2));
      let pointId = outerRev.pointRevs[0].point_id;
      let subPointId = innerRev.pointRevs[0].point_id;

      await Point.apiToggleStar(subPointId, user);
      let stars = await Claim.apiGetStars(outerRev.claim_id, user);
      expect(stars).to.deep.equal({
        star: {
          count: 0,
          starred: false,
        },
        points: {
          [pointId]: {
            count: 0,
            starred: false,
          },
          [subPointId]: {
            count: 1,
            starred: true,
          },
        },
      });
    });
  });
});
