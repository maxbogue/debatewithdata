import chai from 'chai';

import { Claim, Topic, TopicRev } from '../models';
import { ConflictError, NotFoundError } from '../api/error';
import { ValidationError } from '../common/validate';
import { FOO, BAR, BAZ, STARS_AND_COMMENTS,
  registerAndVerifyUser } from './utils';

const expect = chai.expect;

const ID = 'topic-id';
const ID2 = 'topic-id2';

const TITLE = 'title';
const TITLE2 = 'title2';

const DELETE_MSG = 'Violates guidelines.';

const TOPIC_DEPTH_1 = {
  id: ID,
  isRoot: false,
  title: TITLE,
  text: FOO,
  depth: 1,
  childCount: 0,
  ...STARS_AND_COMMENTS,
};

const TOPIC_DEPTH_2 = {
  id: ID,
  isRoot: false,
  title: TITLE,
  text: FOO,
  claimIds: [],
  subTopicIds: [],
  depth: 2,
  childCount: 0,
  ...STARS_AND_COMMENTS,
};

const TOPIC_DEPTH_3 = {
  id: ID,
  isRoot: false,
  title: TITLE,
  text: FOO,
  claimIds: [],
  subTopicIds: [],
  superTopicIds: [],
  depth: 3,
  childCount: 0,
  ...STARS_AND_COMMENTS,
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
      await topicRev.reload(TopicRev.INCLUDE(3));
      expect(topicRev.topicId).to.equal(ID);
      expect(topicRev.parentId).to.be.null;
      expect(topicRev.userId).to.equal(user.id);
      expect(topicRev.deleted).to.be.false;
      expect(topicRev.title).to.equal(TITLE);
      expect(topicRev.blob.text).to.equal(FOO);
      expect(topicRev.claims).to.have.lengthOf(1);
      expect(topicRev.subTopics).to.have.lengthOf(0);

      let claim = topicRev.claims[0];
      expect(claim.id).to.equal(claimRev.claimId);
      expect(claim.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(topicRev.topicId);
      expect(topic.headId).to.equal(topicRev.id);
    });

    it('nested', async function () {
      let subTopicRev = await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE2,
        text: BAR,
      });
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        subTopicIds: [subTopicRev.topicId],
      });
      await topicRev.reload(TopicRev.INCLUDE(3));
      expect(topicRev.topicId).to.equal(ID);
      expect(topicRev.parentId).to.be.null;
      expect(topicRev.userId).to.equal(user.id);
      expect(topicRev.deleted).to.be.false;
      expect(topicRev.title).to.equal(TITLE);
      expect(topicRev.blob.text).to.equal(FOO);
      expect(topicRev.claims).to.have.lengthOf(0);
      expect(topicRev.subTopics).to.have.lengthOf(1);

      let subTopic = topicRev.subTopics[0];
      expect(subTopic.id).to.equal(subTopicRev.topicId);
      expect(subTopic.head.title).to.equal(TITLE2);
      expect(subTopic.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(topicRev.topicId);
      expect(topic.headId).to.equal(topicRev.id);
    });

    it('new sub-topic', async function () {
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        newSubTopics: [{
          id: ID2,
          title: TITLE2,
          text: BAR,
          claimIds: [],
          subTopicIds: [],
        }],
      });
      await topicRev.reload(TopicRev.INCLUDE(3));
      expect(topicRev.topicId).to.equal(ID);
      expect(topicRev.parentId).to.be.null;
      expect(topicRev.userId).to.equal(user.id);
      expect(topicRev.deleted).to.be.false;
      expect(topicRev.title).to.equal(TITLE);
      expect(topicRev.blob.text).to.equal(FOO);
      expect(topicRev.claims).to.have.lengthOf(0);
      expect(topicRev.subTopics).to.have.lengthOf(1);

      let subTopic = topicRev.subTopics[0];
      expect(subTopic.id).to.equal(ID2);
      expect(subTopic.head.title).to.equal(TITLE2);
      expect(subTopic.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(topicRev.topicId);
      expect(topic.headId).to.equal(topicRev.id);
    });

    it('new claim', async function () {
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        newClaims: [{
          text: BAR,
        }],
      });
      await topicRev.reload(TopicRev.INCLUDE(3));
      expect(topicRev.topicId).to.equal(ID);
      expect(topicRev.parentId).to.be.null;
      expect(topicRev.userId).to.equal(user.id);
      expect(topicRev.deleted).to.be.false;
      expect(topicRev.title).to.equal(TITLE);
      expect(topicRev.blob.text).to.equal(FOO);
      expect(topicRev.claims).to.have.lengthOf(1);
      expect(topicRev.subTopics).to.have.lengthOf(0);

      let claim = topicRev.claims[0];
      expect(claim.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(topicRev.topicId);
      expect(topic.headId).to.equal(topicRev.id);
    });
  });

  describe('.apiUpdate()', function () {
    it('normal update', async function () {
      let c1r = await Claim.apiCreate(user, {
        text: BAZ,
      });
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [c1r.claimId],
      });

      let c2r = await Claim.apiCreate(user, {
        text: BAZ,
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE2,
        text: BAR,
        claimIds: [c2r.claimId],
      });

      await r2.reload(TopicRev.INCLUDE(3));
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.false;
      expect(r2.title).to.equal(TITLE2);
      expect(r2.blob.text).to.equal(BAR);
      expect(r2.claims).to.have.lengthOf(1);
      expect(r2.claims[0].id).to.equal(c2r.claimId);
      expect(r2.subTopics).to.have.lengthOf(0);

      let topic = await Topic.findById(ID);
      expect(topic.headId).to.equal(r2.id);
    });

    it('new sub-topic', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: FOO,
        newSubTopics: [{
          id: ID2,
          title: TITLE2,
          text: BAR,
          claimIds: [],
          subTopicIds: [],
        }],
      });
      await r2.reload(TopicRev.INCLUDE(3));
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.false;
      expect(r2.title).to.equal(TITLE);
      expect(r2.blob.text).to.equal(FOO);
      expect(r2.claims).to.have.lengthOf(0);
      expect(r2.subTopics).to.have.lengthOf(1);

      let subTopic = r2.subTopics[0];
      expect(subTopic.id).to.equal(ID2);
      expect(subTopic.head.title).to.equal(TITLE2);
      expect(subTopic.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(r2.topicId);
      expect(topic.headId).to.equal(r2.id);
    });

    it('new claim', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: FOO,
        newClaims: [{
          text: BAR,
        }],
      });
      await r2.reload(TopicRev.INCLUDE(3));
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.false;
      expect(r2.title).to.equal(TITLE);
      expect(r2.blob.text).to.equal(FOO);
      expect(r2.claims).to.have.lengthOf(1);
      expect(r2.subTopics).to.have.lengthOf(0);

      let claim = r2.claims[0];
      expect(claim.head.blob.text).to.equal(BAR);

      let topic = await Topic.findById(r2.topicId);
      expect(topic.headId).to.equal(r2.id);
    });

    it('no change no-op', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: FOO,
      });
      expect(r2.id).to.equal(r1.id);
      expect(r2.parentId).to.be.null;
    });

    it('baseRev', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: BAR,
      });

      // No baseRev.
      await expect(Topic.apiUpdate(ID, user, {
        title: TITLE,
        text: FOO,
      })).to.be.rejectedWith(ValidationError);
      // Garbage baseRev.
      await expect(Topic.apiUpdate(ID, user, {
        baseRev: 'jklsahfjklashd',
        title: TITLE,
        text: FOO,
      })).to.be.rejectedWith(ValidationError);
      // Invalid baseRev.
      await expect(Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: FOO,
      })).to.be.rejectedWith(ConflictError);
    });
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });

      let r2 = await Topic.apiDelete(ID, user, DELETE_MSG);

      await r2.reload(TopicRev.INCLUDE(3));
      expect(r2.topicId).to.equal(ID);
      expect(r2.parentId).to.equal(r1.id);
      expect(r2.userId).to.equal(user.id);
      expect(r2.deleted).to.be.true;
      expect(r2.deleteMessage).to.equal(DELETE_MSG);
      expect(r2.blobHash).to.be.null;
      expect(r2.claims).to.have.lengthOf(0);
      expect(r2.subTopics).to.have.lengthOf(0);

      let topic = await Topic.findById(ID);
      expect(topic.headId).to.equal(r2.id);
    });

    it('already deleted no-op', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });

      let r2 = await Topic.apiDelete(ID, user, DELETE_MSG);
      let r3 = await Topic.apiDelete(ID, user, DELETE_MSG);

      expect(r3.id).to.equal(r2.id);
      expect(r3.parentId).to.equal(r1.id);
    });
  });

  describe('.apiGet()', function () {
    it('happy', async function () {
      let c1r = await Claim.apiCreate(user, {
        text: BAZ,
      });
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
            ...TOPIC_DEPTH_3,
            revId: r1.id,
            claimIds: [c1r.claimId],
            childCount: 1,
          },
        },
        claims: {
          [c1r.claimId]: {
            id: c1r.claimId,
            revId: c1r.id,
            text: BAZ,
            flag: null,
            needsData: null,
            subClaimIds: {},
            sourceIds: {},
            depth: 2,
            childCount: 0,
            dataCounts: [0, 0],
            ...STARS_AND_COMMENTS,
          },
        },
        sources: {},
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
      });
      let r2 = await Topic.apiDelete(ID, user, DELETE_MSG);
      let data = await Topic.apiGet(ID);
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            id: ID,
            isRoot: false,
            revId: r2.id,
            deleted: true,
            deleteMessage: DELETE_MSG,
            superTopicIds: [],
            depth: 3,
            childCount: 0,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
        sources: {},
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('two topics', async function () {
      let t1r = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let t2r = await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE2,
        text: BAR,
      });
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            ...TOPIC_DEPTH_2,
            revId: t1r.id,
          },
          [ID2]: {
            ...TOPIC_DEPTH_2,
            id: ID2,
            revId: t2r.id,
            title: TITLE2,
            text: BAR,
          },
        },
        claims: {},
        sources: {},
      });
    });

    it('excludes deleted', async function () {
      let t1r = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE,
        text: BAR,
      });
      await Topic.apiDelete(ID2, user, DELETE_MSG);
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            ...TOPIC_DEPTH_2,
            revId: t1r.id,
          },
        },
        claims: {},
        sources: {},
      });
    });
  });

  describe('.apiGetRevs()', function () {
    it('with sub-topic and claim', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        baseRev: r1.id,
        title: TITLE,
        text: BAR,
        newClaims: [{
          text: BAZ,
        }],
        newSubTopics: [{
          id: ID2,
          title: TITLE2,
          text: BAZ,
          claimIds: [],
          subTopicIds: [],
        }],
      });
      await r2.reload(TopicRev.INCLUDE(2));
      let claim = r2.claims[0];
      let subTopic = r2.subTopics[0];

      let data = await Topic.apiGetRevs(ID);
      expect(data).to.deep.equal({
        topicRevs: [{
          id: ID,
          revId: r2.id,
          username: user.username,
          createdAt: r2.created_at,
          title: TITLE,
          text: BAR,
          subTopicIds: [ID2],
          claimIds: [claim.id],
        }, {
          id: ID,
          revId: r1.id,
          username: user.username,
          createdAt: r1.created_at,
          title: TITLE,
          text: FOO,
          subTopicIds: [],
          claimIds: [],
        }],
        topics: {
          [ID2]: {
            ...TOPIC_DEPTH_1,
            id: ID2,
            revId: subTopic.headId,
            title: TITLE2,
            text: BAZ,
          },
        },
        claims: {
          [claim.id]: {
            id: claim.id,
            revId: claim.headId,
            text: BAZ,
            flag: null,
            needsData: null,
            depth: 1,
            childCount: 0,
            dataCounts: [0, 0],
            ...STARS_AND_COMMENTS,
          },
        },
      });
    });

    it('bad id', async function () {
      await expect(Topic.apiGetRevs('bad id')).to.be.rejectedWith(
          NotFoundError);
    });
  });

  describe('.apiToggleStar()', function () {
    it('happy', async function () {
      await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
      });
      let star = await Topic.apiToggleStar(ID, user);
      expect(star).to.deep.equal({
        starCount: 1,
        starred: true,
      });
      star = await Topic.apiToggleStar(ID, user);
      expect(star).to.deep.equal({
        starCount: 0,
        starred: false,
      });
    });
  });
});
