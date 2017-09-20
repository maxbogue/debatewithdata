import chai from 'chai';

import { sequelize, Claim, User } from '../models';

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
          type: 'text',
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
          type: 'text',
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
          type: 'text',
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

    it('update point', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
        points: [[{
          type: 'text',
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
          type: 'text',
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
});
