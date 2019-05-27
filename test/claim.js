import chai from 'chai';

import { ConflictError, NotFoundError } from '@/api/error';
import { Filter, Sort, SourceType } from '@/common/constants';
import { Flag } from '@/common/flag';
import { ValidationError } from '@/common/validate';
import { Claim, ClaimRev } from '@/models';

import {
  BAR,
  BAZ,
  FOO,
  STARS_AND_COMMENTS,
  TestSource,
  registerAndVerifyUser,
} from './utils';

const expect = chai.expect;

const DELETE_MSG = 'Violates guidelines.';

const CLAIM_DEPTH_1 = {
  flag: null,
  needsData: null,
  depth: 1,
  childCount: 0,
  dataCounts: [0, 0],
  ...STARS_AND_COMMENTS,
};

const CLAIM_DEPTH_2 = {
  flag: null,
  needsData: null,
  subClaimIds: {},
  sourceIds: {},
  depth: 2,
  childCount: 0,
  dataCounts: [0, 0],
  ...STARS_AND_COMMENTS,
};

const CLAIM_DEPTH_3 = {
  flag: null,
  needsData: null,
  subClaimIds: {},
  sourceIds: {},
  superTopicIds: [],
  superClaimIds: [],
  depth: 3,
  childCount: 0,
  dataCounts: [0, 0],
  ...STARS_AND_COMMENTS,
};

describe('Claim', function() {
  let user;

  beforeEach(async function() {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function() {
    it('text only', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await rev.reload(ClaimRev.INCLUDE(1));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;
      expect(rev.flag).to.be.null;

      const claim = await Claim.findByPk(rev.claimId);
      expect(claim.headId).to.equal(rev.id);
    });

    it('with flag', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
      });
      await rev.reload(ClaimRev.INCLUDE(1));
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.flag).to.equal(Flag.AD_HOMINEM);
    });

    it('with claim for', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: true,
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;

      expect(rev.subClaims).to.have.lengthOf(1);
      const subClaim = rev.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.true;
    });

    it('with claim against', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: false,
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.userId).to.equal(user.id);
      expect(rev.blob.text).to.equal(FOO);
      expect(rev.parentId).to.be.null;
      expect(rev.claimId).to.exist;

      expect(rev.subClaims).to.have.lengthOf(1);
      const subClaim = rev.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.false;
    });
  });

  describe('.apiUpdate()', function() {
    it('change text', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      let claim = await Claim.findByPk(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      const r2 = await Claim.apiUpdate(r1.claimId, user, {
        baseRev: r1.id,
        text: BAR,
      });
      await r2.reload(ClaimRev.INCLUDE(2));
      expect(r2.userId).to.equal(user.id);
      expect(r2.claimId).to.equal(r1.claimId);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.subClaims).to.have.lengthOf(0);
      expect(r2.sources).to.have.lengthOf(0);

      claim = await Claim.findByPk(r1.claimId);
      expect(claim.headId).to.equal(r2.id);
    });

    it('add claim', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      const claim = await Claim.findByPk(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      const r2 = await Claim.apiUpdate(r1.claimId, user, {
        baseRev: r1.id,
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: true,
          },
        ],
      });
      await r2.reload(ClaimRev.INCLUDE(2));

      expect(r2.subClaims).to.have.lengthOf(1);
      const subClaim = r2.subClaims[0];
      expect(subClaim.head.userId).to.equal(user.id);
      expect(subClaim.head.blob.text).to.equal(BAR);
      expect(subClaim.claimClaim.isFor).to.be.true;
    });

    it('cycle fails', async function() {
      const c1r = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: false,
          },
        ],
      });
      await c1r.reload(ClaimRev.INCLUDE(2));

      expect(c1r.subClaims).to.have.lengthOf(1);
      const c2 = c1r.subClaims[0];

      await expect(
        Claim.apiUpdate(c2.id, user, {
          baseRev: c2.headId,
          text: BAR,
          subClaimIds: {
            [c1r.claimId]: true,
          },
        })
      ).to.be.rejectedWith(ValidationError);
    });

    it('no change no-op', async function() {
      const r1 = await Claim.apiCreate(user, { text: FOO });
      const r2 = await Claim.apiUpdate(r1.claimId, user, {
        baseRev: r1.id,
        text: FOO,
      });
      expect(r2.id).to.equal(r1.id);
      expect(r2.parentId).to.be.null;
    });

    it('baseRev', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      const claimId = r1.claimId;
      await Claim.apiUpdate(claimId, user, {
        baseRev: r1.id,
        text: BAR,
      });

      // No baseRev.
      await expect(
        Claim.apiUpdate(claimId, user, {
          text: FOO,
        })
      ).to.be.rejectedWith(ValidationError);
      // Garbage baseRev.
      await expect(
        Claim.apiUpdate(claimId, user, {
          baseRev: 'jklsahfjklashd',
          text: FOO,
        })
      ).to.be.rejectedWith(ValidationError);
      // Invalid baseRev.
      await expect(
        Claim.apiUpdate(claimId, user, {
          baseRev: r1.id,
          text: FOO,
        })
      ).to.be.rejectedWith(ConflictError);
    });
  });

  describe('.apiDelete()', function() {
    it('happy', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      const claim = await Claim.findByPk(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      const r2 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
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

    it('no-op', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      const claim = await Claim.findByPk(r1.claimId);
      expect(claim.headId).to.equal(r1.id);

      const r2 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
      await claim.reload();
      expect(claim.headId).to.equal(r2.id);

      const r3 = await Claim.apiDelete(claim.id, user, DELETE_MSG);
      expect(r3.id).to.equal(r2.id);
      expect(r3.parentId).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function() {
    it('no points', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        flag: Flag.AD_HOMINEM,
      });
      const claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            flag: Flag.AD_HOMINEM,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('starred', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
      });
      await Claim.apiToggleStar(rev.claimId, user);
      const claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            starCount: 1,
            starred: true,
          },
        },
        topics: {},
        sources: {},
      });
      const claimDataNoUser = await Claim.apiGet(rev.claimId);
      expect(claimDataNoUser).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            starCount: 1,
            starred: false,
            watched: false,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('two points', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: true,
          },
          {
            text: BAZ,
            isFor: false,
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(2));
      expect(rev.subClaims).to.have.lengthOf(2);
      const c1 = rev.subClaims[rev.subClaims[0].claimClaim.isFor ? 0 : 1];
      const c2 = rev.subClaims[rev.subClaims[0].claimClaim.isFor ? 1 : 0];
      const claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            subClaimIds: {
              [c1.id]: true,
              [c2.id]: false,
            },
            childCount: 2,
          },
          [c1.id]: {
            ...CLAIM_DEPTH_2,
            id: c1.id,
            revId: c1.headId,
            updatedAt: c1.head.created_at,
            text: BAR,
          },
          [c2.id]: {
            ...CLAIM_DEPTH_2,
            id: c2.id,
            revId: c2.headId,
            updatedAt: c2.head.created_at,
            text: BAZ,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('nested points', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: true,
            newSubClaims: [
              {
                text: BAZ,
                isFor: true,
              },
            ],
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(3));
      expect(rev.subClaims).to.have.lengthOf(1);
      const c1 = rev.subClaims[0];
      expect(c1.head.subClaims).to.have.lengthOf(1);
      const c1a = c1.head.subClaims[0];

      const claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            subClaimIds: {
              [c1.id]: true,
            },
            childCount: 2,
          },
          [c1.id]: {
            ...CLAIM_DEPTH_2,
            id: c1.id,
            revId: c1.headId,
            updatedAt: c1.head.created_at,
            text: BAR,
            subClaimIds: {
              [c1a.id]: true,
            },
            childCount: 1,
          },
          [c1a.id]: {
            ...CLAIM_DEPTH_1,
            id: c1a.id,
            revId: c1a.headId,
            updatedAt: c1a.head.created_at,
            text: BAZ,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('nested source', async function() {
      const URL = 'https://debatewithdata.org';
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSources: [
          {
            isFor: true,
            url: URL,
            text: BAR,
            type: SourceType.MISC,
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(3));
      expect(rev.sources).to.have.lengthOf(1);
      const s1 = rev.sources[0];

      const claimData = await Claim.apiGet(rev.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_3,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            sourceIds: {
              [s1.id]: true,
            },
            childCount: 1,
            dataCounts: [1, 0],
          },
        },
        topics: {},
        sources: {
          [s1.id]: {
            ...STARS_AND_COMMENTS,
            id: s1.id,
            revId: s1.headId,
            updatedAt: s1.head.created_at,
            type: SourceType.MISC,
            url: URL,
            text: BAR,
            date: null,
            table: null,
            chart: null,
            institution: null,
            publication: null,
          },
        },
      });
    });

    it('includes supers', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
        newSubClaims: [
          {
            text: BAR,
            isFor: true,
          },
        ],
      });
      await rev.reload(ClaimRev.INCLUDE(3));
      expect(rev.subClaims).to.have.lengthOf(1);
      const c1 = rev.subClaims[0];

      let claimData = await Claim.apiGet(c1.id, user, false);
      expect(claimData).to.deep.equal({
        claims: {
          [rev.claimId]: {
            ...CLAIM_DEPTH_1,
            id: rev.claimId,
            revId: rev.id,
            updatedAt: rev.created_at,
            text: FOO,
            childCount: 1,
          },
          [c1.id]: {
            ...CLAIM_DEPTH_3,
            id: c1.id,
            revId: c1.headId,
            updatedAt: c1.head.created_at,
            text: BAR,
            superClaimIds: [rev.claimId],
          },
        },
        topics: {},
        sources: {},
      });

      claimData = await Claim.apiGet(c1.id, user, true);
      expect(claimData).to.deep.equal({
        claims: {
          [c1.id]: {
            ...CLAIM_DEPTH_2,
            depth: 3,
            id: c1.id,
            revId: c1.headId,
            updatedAt: c1.head.created_at,
            text: BAR,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('bad ID', function() {
      return expect(Claim.apiGet('bad id')).to.be.rejected;
    });

    it('deleted', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      const r2 = await Claim.apiDelete(r1.claimId, user, DELETE_MSG);
      const claimData = await Claim.apiGet(r1.claimId, user);
      expect(claimData).to.deep.equal({
        claims: {
          [r2.claimId]: {
            id: r2.claimId,
            revId: r2.id,
            updatedAt: r2.created_at,
            deleted: true,
            deleteMessage: DELETE_MSG,
            superTopicIds: [],
            superClaimIds: [],
            depth: 3,
            childCount: 0,
            dataCounts: [0, 0],
            ...STARS_AND_COMMENTS,
          },
        },
        topics: {},
        sources: {},
      });
    });
  });

  describe('.apiGetAll()', function() {
    it('two claims', async function() {
      const c1r = await Claim.apiCreate(user, { text: FOO });
      const c2r = await Claim.apiCreate(user, { text: BAR });
      const c1Id = c1r.claimId;
      const c2Id = c2r.claimId;
      await Claim.apiToggleStar(c2Id, user);

      const c1Data = {
        [c1Id]: {
          ...CLAIM_DEPTH_1,
          id: c1Id,
          revId: c1r.id,
          updatedAt: c1r.created_at,
          deleted: false,
          deleteMessage: null,
          text: FOO,
          subClaimIds: {},
          sourceIds: {},
        },
      };
      const c2Data = {
        [c2Id]: {
          ...CLAIM_DEPTH_1,
          id: c2Id,
          revId: c2r.id,
          updatedAt: c2r.created_at,
          deleted: false,
          deleteMessage: null,
          text: BAR,
          subClaimIds: {},
          sourceIds: {},
          starCount: 1,
          starred: true,
        },
      };

      let claimsData = await Claim.apiGetAll({ user });
      expect(claimsData).to.deep.equal({
        results: [c2Id, c1Id],
        numPages: 1,
        claims: { ...c1Data, ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        sort: [Sort.STARS, true],
      });
      expect(claimsData).to.deep.equal({
        results: [c2Id, c1Id],
        numPages: 1,
        claims: { ...c1Data, ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        sort: [Sort.STARS, false],
      });
      expect(claimsData).to.deep.equal({
        results: [c1Id, c2Id],
        numPages: 1,
        claims: { ...c1Data, ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        sort: [Sort.RECENT, false],
      });
      expect(claimsData).to.deep.equal({
        results: [c1Id, c2Id],
        numPages: 1,
        claims: { ...c1Data, ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        sort: [Sort.RECENT, true],
      });
      expect(claimsData).to.deep.equal({
        results: [c2Id, c1Id],
        numPages: 1,
        claims: { ...c1Data, ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        filters: {
          [Filter.STARRED]: true,
        },
      });
      expect(claimsData).to.deep.equal({
        results: [c2Id],
        numPages: 1,
        claims: { ...c2Data },
      });

      claimsData = await Claim.apiGetAll({
        user,
        filters: {
          [Filter.STARRED]: false,
        },
      });
      expect(claimsData).to.deep.equal({
        results: [c1Id],
        numPages: 1,
        claims: { ...c1Data },
      });
    });

    it('excludes deleted', async function() {
      const c1r = await Claim.apiCreate(user, { text: FOO });
      const c2r = await Claim.apiCreate(user, { text: BAR });
      await Claim.apiDelete(c2r.claimId, user, DELETE_MSG);
      const claimsData = await Claim.apiGetAll({ user });
      expect(claimsData).to.deep.equal({
        results: [c1r.claimId],
        numPages: 1,
        claims: {
          [c1r.claimId]: {
            ...CLAIM_DEPTH_1,
            id: c1r.claimId,
            revId: c1r.id,
            updatedAt: c1r.created_at,
            deleted: false,
            deleteMessage: null,
            text: FOO,
            subClaimIds: {},
            sourceIds: {},
          },
        },
      });
    });
  });

  describe('.apiGetForTrail()', function() {
    it('happy', async function() {
      const sourceRev = await TestSource.create(user);
      const c2r = await Claim.apiCreate(user, {
        text: BAR,
        sourceIds: { [sourceRev.sourceId]: false },
      });
      const c1r = await Claim.apiCreate(user, {
        text: FOO,
        subClaimIds: { [c2r.claimId]: true },
      });

      // Extra claim to make sure they're selected by ID.
      await Claim.apiCreate(user, { text: BAZ });

      const data = await Claim.apiGetForTrail(
        [c1r.claimId, c2r.claim_id],
        user
      );
      expect(data).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            ...CLAIM_DEPTH_1,
            id: c1r.claimId,
            revId: c1r.id,
            updatedAt: c1r.created_at,
            deleted: false,
            deleteMessage: null,
            childCount: 2,
            dataCounts: [0, 1],
            text: FOO,
            subClaimIds: { [c2r.claimId]: true },
            sourceIds: {},
          },
          [c2r.claimId]: {
            ...CLAIM_DEPTH_1,
            id: c2r.claimId,
            revId: c2r.id,
            updatedAt: c2r.created_at,
            deleted: false,
            deleteMessage: null,
            childCount: 1,
            dataCounts: [0, 1],
            text: BAR,
            subClaimIds: {},
            sourceIds: { [sourceRev.sourceId]: false },
          },
        },
      });

      const noUserData = await Claim.apiGetForTrail([
        c1r.claimId,
        c2r.claim_id,
      ]);
      expect(noUserData).to.deep.equal({
        claims: {
          [c1r.claimId]: {
            ...CLAIM_DEPTH_1,
            id: c1r.claimId,
            revId: c1r.id,
            updatedAt: c1r.created_at,
            deleted: false,
            deleteMessage: null,
            childCount: 2,
            dataCounts: [0, 1],
            text: FOO,
            subClaimIds: { [c2r.claimId]: true },
            sourceIds: {},
            watched: false,
          },
          [c2r.claimId]: {
            ...CLAIM_DEPTH_1,
            id: c2r.claimId,
            revId: c2r.id,
            updatedAt: c2r.created_at,
            deleted: false,
            deleteMessage: null,
            childCount: 1,
            dataCounts: [0, 1],
            text: BAR,
            subClaimIds: {},
            sourceIds: { [sourceRev.sourceId]: false },
            watched: false,
          },
        },
      });
    });
  });

  describe('apiGetRevs', function() {
    it('change text', async function() {
      const r1 = await Claim.apiCreate(user, {
        text: FOO,
      });
      await r1.reload(ClaimRev.INCLUDE(2));
      const claimId = r1.claimId;

      const r2 = await Claim.apiUpdate(claimId, user, {
        baseRev: r1.id,
        text: BAR,
      });
      await r2.reload(ClaimRev.INCLUDE(2));

      const data = await Claim.apiGetRevs(claimId, user);
      expect(data).to.deep.equal({
        claimRevs: [
          {
            id: claimId,
            revId: r2.id,
            username: user.username,
            createdAt: r2.created_at,
            updatedAt: r2.created_at,
            text: BAR,
            flag: null,
            needsData: null,
            subClaimIds: {},
            sourceIds: {},
          },
          {
            id: claimId,
            revId: r1.id,
            username: user.username,
            createdAt: r1.created_at,
            updatedAt: r1.created_at,
            text: FOO,
            flag: null,
            needsData: null,
            subClaimIds: {},
            sourceIds: {},
          },
        ],
        claims: {
          [r2.claimId]: {
            ...CLAIM_DEPTH_1,
            id: r2.claimId,
            revId: r2.id,
            updatedAt: r2.created_at,
            text: BAR,
          },
        },
        topics: {},
        sources: {},
      });
    });

    it('bad id', async function() {
      await expect(Claim.apiGetRevs('bad id')).to.be.rejectedWith(
        NotFoundError
      );
    });
  });

  describe('.apiToggleStar()', function() {
    it('happy', async function() {
      const rev = await Claim.apiCreate(user, {
        text: FOO,
      });
      let star = await Claim.apiToggleStar(rev.claimId, user);
      expect(star).to.deep.equal({
        starCount: 1,
        starred: true,
        watched: true,
      });
      star = await Claim.apiToggleStar(rev.claimId, user);
      expect(star).to.deep.equal({
        starCount: 0,
        starred: false,
        watched: true,
      });
    });
  });
});
