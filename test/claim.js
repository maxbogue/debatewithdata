import chai from 'chai';

import { sequelize, Claim, Point, User } from '../models';

const expect = chai.expect;

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

const USERNAME = 'test';
const PASSWORD = 'testtest';
const EMAIL = 'test@debatewithdata.org';

describe('Claim', function () {
  let user;

  beforeEach(async function () {
    await sequelize.sync({ force: true });
    user = await User.register(USERNAME, PASSWORD, EMAIL);
  });

  describe('.apiCreate()', function () {
    it('text only', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await claimRev.reload(Claim.INCLUDE_TEXT);
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
      await claimRev.reload(Claim.INCLUDE_POINTS);
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
      await claimRev.reload(Claim.INCLUDE_POINTS);
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
      await r2.reload(Claim.INCLUDE_POINTS);
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
      await r2.reload(Claim.INCLUDE_POINTS);
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
      await r1.reload(Claim.INCLUDE_POINTS);
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
      await r2.reload(Claim.INCLUDE_POINTS);
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
      await r2.reload(Claim.INCLUDE_POINTS);
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
      let claimData = await Claim.apiGet(rev.claim_id);
      expect(claimData).to.deep.equal({
        rev: rev.id,
        text: FOO,
        points: [{}, {}],
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
      await rev.reload(Claim.INCLUDE_POINTS);
      expect(rev.pointRevs).to.have.lengthOf(2);
      let p1 = rev.pointRevs[rev.pointRevs[0].claimPoint.isFor ? 0 : 1];
      let p2 = rev.pointRevs[rev.pointRevs[0].claimPoint.isFor ? 1 : 0];
      let claimData = await Claim.apiGet(rev.claim_id);
      expect(claimData).to.deep.equal({
        rev: rev.id,
        text: FOO,
        points: [{
          [p1.point_id]: {
            rev: p1.id,
            type: Point.TEXT,
            text: BAR,
          },
        }, {
          [p2.point_id]: {
            rev: p2.id,
            type: Point.TEXT,
            text: BAZ,
          },
        }],
      });
    });

    it.only('nested points', async function () {
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
      await rev.reload(Claim.INCLUDE_POINTS);
      expect(rev.pointRevs).to.have.lengthOf(1);
      let p1 = rev.pointRevs[0];
      expect(p1.pointRevs).to.have.lengthOf(1);
      let p1a = p1.pointRevs[0];
      let claimData = await Claim.apiGet(rev.claim_id);
      expect(claimData).to.deep.equal({
        rev: rev.id,
        text: FOO,
        points: [{
          [p1.point_id]: {
            rev: p1.id,
            type: Point.SUBCLAIM,
            text: BAR,
            points: [{
              [p1a.point_id]: {
                rev: p1a.id,
                type: Point.TEXT,
                text: BAZ,
              },
            }, {}],
          },
        }, {}],
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
        rev: r2.id,
        deleted: true,
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two claims', async function () {
      let c1r = await Claim.apiCreate(user, { text: FOO });
      let c2r = await Claim.apiCreate(user, { text: BAR });
      let claimsData = await Claim.apiGetAll();
      expect(claimsData).to.deep.equal({
        [c1r.claim_id]: {
          rev: c1r.id,
          text: FOO,
          points: [{}, {}],
        },
        [c2r.claim_id]: {
          rev: c2r.id,
          text: BAR,
          points: [{}, {}],
        },
      });
    });

    it('excludes deleted', async function () {
      let c1r = await Claim.apiCreate(user, { text: FOO });
      let c2r = await Claim.apiCreate(user, { text: BAR });
      await Claim.apiDelete(c2r.claim_id, user);
      let claimsData = await Claim.apiGetAll();
      expect(claimsData).to.deep.equal({
        [c1r.claim_id]: {
          rev: c1r.id,
          text: FOO,
          points: [{}, {}],
        }
      });
    });
  });
});
