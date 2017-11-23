import chai from 'chai';

import { Claim, Topic, TopicRev } from '../models';
import { NotFoundError } from '../api/error';
import { registerAndVerifyUser } from './utils';

const expect = chai.expect;

const ID = 'topicId';
const ID2 = 'topicId2';

const TITLE = 'title';
const TITLE2 = 'title2';

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

const STARS_AND_COMMENTS = {
  star: {
    count: 0,
    starred: false,
  },
  commentCount: 0,
};

describe('Topic', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('happy', async function () {
      let claimRev = await Claim.apiCreate(user, { text: BAR });
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [claimRev.claimId],
      });
      await topicRev.reload(TopicRev.INCLUDE());
      expect(topicRev.topicId).to.equal(ID);
      expect(topicRev.parentId).to.be.null;
      expect(topicRev.userId).to.equal(user.id);
      expect(topicRev.deleted).to.be.false;
      expect(topicRev.title).to.equal(TITLE);
      expect(topicRev.blob.text).to.equal(FOO);
      expect(topicRev.claims).to.have.lengthOf(1);

      let claim = topicRev.claims[0];
      expect(claim.id).to.equal(claimRev.claimId);
      expect(claim.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(topicRev.topicId);
      expect(topic.headId).to.equal(topicRev.id);
    });
  });

  describe('.apiUpdate()', function () {
    it('normal update', async function () {
      let c1r = await Claim.apiCreate(user, { text: BAZ });
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [c1r.claimId],
      });

      let c2r = await Claim.apiCreate(user, { text: BAZ });
      let r2 = await Topic.apiUpdate(ID, user, {
        title: TITLE2,
        text: BAR,
        claimIds: [c2r.claimId],
      });

      await r2.reload(TopicRev.INCLUDE());
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.false;
      expect(r2.title).to.equal(TITLE2);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.claims).to.have.lengthOf(1);
      expect(r2.claims[0].id).to.equal(c2r.claimId);

      let topic = await Topic.findById(ID);
      expect(topic.headId).to.equal(r2.id);
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
      });

      let r2 = await Topic.apiDelete(ID, user);

      await r2.reload(TopicRev.INCLUDE());
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.true;
      expect(r2.blobHash).to.be.null;
      expect(r2.claims).to.have.lengthOf(0);

      let topic = await Topic.findById(ID);
      expect(topic.headId).to.equal(r2.id);
    });

    it('already deleted no-op', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
      });

      let r2 = await Topic.apiDelete(ID, user);
      let r3 = await Topic.apiDelete(ID, user);

      expect(r3.id).to.equal(r2.id);
      expect(r3.parentId).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function () {
    it('happy', async function () {
      let c1r = await Claim.apiCreate(user, { text: BAZ });
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [c1r.claimId],
      });
      let data = await Topic.apiGet(ID);
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            rev: r1.id,
            title: TITLE,
            text: FOO,
            claimIds: [c1r.claimId],
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {
          [c1r.claimId]: {
            rev: c1r.id,
            text: BAZ,
            depth: 1,
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });

    it('not found', async function () {
      await expect(Topic.apiGet('bad id')).to.be.rejectedWith(NotFoundError);
    });

    it('deleted', async function () {
      await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
      });
      let r2 = await Topic.apiDelete(ID, user);
      let data = await Topic.apiGet(ID);
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            rev: r2.id,
            deleted: true,
          },
        },
        claims: {},
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two topics', async function () {
      let t1r = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
      });
      let t2r = await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE2,
        text: BAR,
        claimIds: [],
      });
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            rev: t1r.id,
            title: TITLE,
            text: FOO,
            claimIds: [],
            ...STARS_AND_COMMENTS,
          },
          [ID2]: {
            rev: t2r.id,
            title: TITLE2,
            text: BAR,
            claimIds: [],
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });

    it('excludes deleted', async function () {
      let t1r = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
      });
      await Topic.apiCreate(user, {
        id: ID2,
        text: BAR,
        claimIds: [],
      });
      await Topic.apiDelete(ID2, user);
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            rev: t1r.id,
            title: TITLE,
            text: FOO,
            claimIds: [],
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      await Topic.apiCreate(user, {
        id: ID,
        text: FOO,
        claimIds: [],
      });
      let star = await Topic.apiToggleStar(ID, user);
      expect(star).to.deep.equal({
        count: 1,
        starred: true,
      });
      star = await Topic.apiToggleStar(ID, user);
      expect(star).to.deep.equal({
        count: 0,
        starred: false,
      });
    });
  });
});
