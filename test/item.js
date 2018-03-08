import request from 'supertest';

import app from '../app';

import {
  TestClaim, TestSource, TestTopic, registerAndVerifyUser } from './utils';

describe('Item', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('get item', function () {
    it('none', async function () {
      return request(app).get('/api/item/blah').expect(404);
    });

    it('topic', async function () {
      let topicRev = await TestTopic.create(user);
      let topicId = topicRev.topicId;
      return request(app)
        .get('/api/item/' + topicId)
        .expect(200, {
          topics: {
            [topicId]: TestTopic.verify(topicRev),
          },
          claims: {},
        });
    });

    it('claim', async function () {
      let claimRev = await TestClaim.create(user);
      let claimId = claimRev.claimId;
      return request(app)
        .get('/api/item/' + claimId)
        .expect(200, {
          claims: {
            [claimId]: TestClaim.verify(claimRev),
          },
          sources: {},
        });
    });

    it('source', async function () {
      let sourceRev = await TestSource.create(user);
      let sourceId = sourceRev.sourceId;
      return request(app)
        .get('/api/item/' + sourceId)
        .expect(200, {
          sources: {
            [sourceId]: TestSource.verify(sourceRev),
          },
          claims: {},
        });
    });
  });
});
