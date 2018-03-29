import chai from 'chai';

import { Claim, ClaimRev } from '../models';
import { Flag } from '../common/flag';
import { NotFoundError } from '../api/error';
import { FOO, BAR, BAZ, STARS_AND_COMMENTS,
  registerAndVerifyUser } from './utils';

const expect = chai.expect;

const DELETE_MSG = 'Violates guidelines.';

describe('Claim', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('text only', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await rev.reload(ClaimRev.INCLUDE(1));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;
      expect(rev.flag).to.be.null;

      let claim = await Claim.findById(rev.claimId);
      expect(claim.headId).to.equal(rev.id);
    });

    it('with flag', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
      });
      await rev.reload(ClaimRev.INCLUDE(1));
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.flag).to.equal(Flag.AD_HOMINEM);
    });

    it('with claim for', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [{
          text: BAR,
          isFor: true,
        }],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;

      expect(rev.subClaims).to.have.lengthOf(1);
      let subClaim = rev.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.true;
    });

    it('with claim against', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [{
          text: BAR,
          isFor: false,
        }],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;

      expect(rev.subClaims).to.have.lengthOf(1);
      let subClaim = rev.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.false;
    });
  });

  describe('.apiUpdate()', function () {
    it('change text', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
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
      expect(r2.subClaims).to.have.lengthOf(0);
      expect(r2.sources).to.have.lengthOf(0);

      claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r2.id);
    });

    it('add claim', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      let claim = await Claim.findById(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      let r2 = await Claim.apiUpdate(r1.claimId, user, {
        text: FOO,
        newSubClaims: [{
          text: BAR,
          isFor: true,
        }],
      });
      await r2.reload(ClaimRev.INCLUDE(2));

      expect(r2.subClaims).to.have.lengthOf(1);
      let subClaim = r2.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.true;
    });
  });

  describe('.apiDelete()', function () {
    it('happy', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
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
      expect(r2.subClaims).to.have.lengthOf(0);
      expect(r2.sources).to.have.lengthOf(0);

      await claim.reload();
      expect(claim.headId).to.equal(r2.id);
    });

    it('no-op', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
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
      });
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            flag: Flag.AD_HOMINEM,
            subClaimIds: {},
            sourceIds: {},
            depth: 3,
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
        },
        sources: {},
      });
    });

    it('starred', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await Claim.apiToggleStar(rev.claimId, user);
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            subClaimIds: {},
            sourceIds: {},
            depth: 3,
            childCount: 0,
            star: {
              count: 1,
              starred: true,
            },
            commentCount: 0,
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
            subClaimIds: {},
            sourceIds: {},
            depth: 3,
            childCount: 0,
            star: {
              count: 1,
              starred: false,
            },
            commentCount: 0,
          },
        },
        sources: {},
      });
    });

    it('two points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [{
          text: BAR,
          isFor: true,
        }, {
          text: BAZ,
          isFor: false,
        }],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.subClaims).to.have.lengthOf(2);
      let c1 = rev.subClaims[rev.subClaims[0].claimClaim.isFor ? 0 : 1];
      let c2 = rev.subClaims[rev.subClaims[0].claimClaim.isFor ? 1 : 0];
      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            subClaimIds: {
              [c1.id]: true,
              [c2.id]: false,
            },
            sourceIds: {},
            depth: 3,
            childCount: 2,
            ...STARS_AND_COMMENTS,
          },
          [c1.id]: {
            id: c1.id,
            revId: c1.headId,
            text: BAR,
            subClaimIds: {},
            sourceIds: {},
            depth: 2,
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
          [c2.id]: {
            id: c2.id,
            revId: c2.headId,
            text: BAZ,
            subClaimIds: {},
            sourceIds: {},
            depth: 2,
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
        },
        sources: {},
      });
    });

    it('nested points', async function () {
      let rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [{
          text: BAR,
          isFor: true,
          newSubClaims: [{
            text: BAZ,
            isFor: true,
          }],
        }],
      });
      await rev.reload(ClaimRev.INCLUDE(3));
      expect(rev.subClaims).to.have.lengthOf(1);
      let c1 = rev.subClaims[0];
      expect(c1.head.subClaims).to.have.lengthOf(1);
      let c1a = c1.head.subClaims[0];

      let claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            id: rev.claimId,
            revId: rev.id,
            text: FOO,
            subClaimIds: {
              [c1.id]: true,
            },
            sourceIds: {},
            depth: 3,
            childCount: 2,
            ...STARS_AND_COMMENTS,
          },
          [c1.id]: {
            id: c1.id,
            revId: c1.headId,
            text: BAR,
            subClaimIds: {
              [c1a.id]: true,
            },
            sourceIds: {},
            depth: 2,
            childCount: 1,
            ...STARS_AND_COMMENTS,
          },
          [c1a.id]: {
            id: c1a.id,
            revId: c1a.headId,
            text: BAZ,
            depth: 1,
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
        },
        sources: {},
      });
    });

    it('bad ID', function () {
      return expect(Claim.apiGet('bad id')).to.be.rejected;
    });

    it('deleted', async function () {
      let r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      let r2 = await Claim.apiDelete(r1.claimId, user, DELETE_MSG);
      let claimData = await Claim.apiGet(r1.claimId);
      expect(claimData).to.deep.equal({
        claims: {
          [r2.claimId]: {
            id: r2.claimId,
            revId: r2.id,
            deleted: true,
            deleteMessage: DELETE_MSG,
            depth: 3,
            childCount: 0,
            ...STARS_AND_COMMENTS,
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
      });
      let c2r = await Claim.apiCreate(user, {
        text: BAR,
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
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
          [c2r.claimId]: {
            id: c2r.claimId,
            revId: c2r.id,
            text: BAR,
            depth: 1,
            childCount: 0,
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
      });
      let c2r = await Claim.apiCreate(user, {
        text: BAR,
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
            childCount: 0,
            ...STARS_AND_COMMENTS,
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
      });
      await r1.reload(ClaimRev.INCLUDE(2));
      let claimId = r1.claimId;

      let r2 = await Claim.apiUpdate(claimId, user, {
        text: BAR,
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
          subClaimIds: {},
          sourceIds: {},
        }, {
          id: claimId,
          revId: r1.id,
          username: user.username,
          createdAt: r1.created_at,
          text: FOO,
          subClaimIds: {},
          sourceIds: {},
        }],
        claims: {},
        sources: {},
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
