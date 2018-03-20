import chai from 'chai';

import { Claim, Topic, TopicRev } from '../models';
import { NotFoundError } from '../api/error';
import { FOO, BAR, BAZ, STARS_AND_COMMENTS,
  registerAndVerifyUser } from './utils';

const expect = chai.expect;

const ID = 'topic-id';
const ID2 = 'topic-id2';

const TITLE = 'title';
const TITLE2 = 'title2';

const DELETE_MSG = 'Violates guidelines.';

describe('Topic', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('.apiCreate()', function () {
    it('happy', async function () {
      let claimRev = await Claim.apiCreate(user, {
        text: BAR,
        points: [[], []],
      });
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [claimRev.claimId],
        subTopicIds: [],
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
        claimIds: [],
        subTopicIds: [],
      });
      let topicRev = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
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
        claimIds: [],
        subTopicIds: [],
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
        claimIds: [],
        subTopicIds: [],
        newClaims: [{
          text: BAR,
          points: [[], []],
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
        points: [[], []],
      });
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [c1r.claimId],
        subTopicIds: [],
      });

      let c2r = await Claim.apiCreate(user, {
        text: BAZ,
        points: [[], []],
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        title: TITLE2,
        text: BAR,
        claimIds: [c2r.claimId],
        subTopicIds: [],
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
        claimIds: [],
        subTopicIds: [],
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        title: TITLE,
        text: FOO,
        claimIds: [],
        subTopicIds: [],
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
        claimIds: [],
        subTopicIds: [],
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        title: TITLE,
        text: FOO,
        claimIds: [],
        subTopicIds: [],
        newClaims: [{
          text: BAR,
          points: [[], []],
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
  });

  describe('.apiDelete()', function () {
    it('normal delete', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [],
        subTopicIds: [],
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
        claimIds: [],
        subTopicIds: [],
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
        points: [[], []],
      });
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        claimIds: [c1r.claimId],
        subTopicIds: [],
      });
      let data = await Topic.apiGet(ID);
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            id: ID,
            revId: r1.id,
            title: TITLE,
            text: FOO,
            claimIds: [c1r.claimId],
            subTopicIds: [],
            depth: 3,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {
          [c1r.claimId]: {
            id: c1r.claimId,
            revId: c1r.id,
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
        subTopicIds: [],
      });
      let r2 = await Topic.apiDelete(ID, user, DELETE_MSG);
      let data = await Topic.apiGet(ID);
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            id: ID,
            revId: r2.id,
            deleted: true,
            deleteMessage: DELETE_MSG,
            depth: 3,
            ...STARS_AND_COMMENTS,
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
        subTopicIds: [],
      });
      let t2r = await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE2,
        text: BAR,
        claimIds: [],
        subTopicIds: [],
      });
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            id: ID,
            revId: t1r.id,
            title: TITLE,
            text: FOO,
            claimIds: [],
            subTopicIds: [],
            depth: 2,
            ...STARS_AND_COMMENTS,
          },
          [ID2]: {
            id: ID2,
            revId: t2r.id,
            title: TITLE2,
            text: BAR,
            claimIds: [],
            subTopicIds: [],
            depth: 2,
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
        subTopicIds: [],
      });
      await Topic.apiCreate(user, {
        id: ID2,
        title: TITLE,
        text: BAR,
        claimIds: [],
        subTopicIds: [],
      });
      await Topic.apiDelete(ID2, user, DELETE_MSG);
      let data = await Topic.apiGetAll();
      expect(data).to.deep.equal({
        topics: {
          [ID]: {
            id: ID,
            revId: t1r.id,
            title: TITLE,
            text: FOO,
            claimIds: [],
            subTopicIds: [],
            depth: 2,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {},
      });
    });
  });

  describe('.apiGetRevs()', function () {
    it('with sub-topic and claim', async function () {
      let r1 = await Topic.apiCreate(user, {
        id: ID,
        title: TITLE,
        text: FOO,
        subTopicIds: [],
        claimIds: [],
      });
      let r2 = await Topic.apiUpdate(ID, user, {
        title: TITLE,
        text: BAR,
        subTopicIds: [],
        claimIds: [],
        newClaims: [{
          text: BAZ,
          points: [[], []],
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
            id: ID2,
            revId: subTopic.headId,
            title: TITLE2,
            text: BAZ,
            claimIds: [],
            subTopicIds: [],
            depth: 1,
            ...STARS_AND_COMMENTS,
          },
        },
        claims: {
          [claim.id]: {
            id: claim.id,
            revId: claim.headId,
            text: BAZ,
            depth: 1,
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
        claimIds: [],
        subTopicIds: [],
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
