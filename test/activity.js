import request from 'supertest';

import app from '../app';

import { FOO, BAR, TestClaim, TestSource, TestTopic,
  registerAndVerifyUser } from './utils';
import { Claim, Comment } from '../models';
import { ItemType } from '../common/constants';

describe('Activity', function () {
  let user;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
  });

  describe('get activity', function () {
    it('none', async function () {
      return request(app).get('/api/activity').expect(200, []);
    });

    it('variety', async function () {
      let topicRev = await TestTopic.create(user);
      let claimRev = await TestClaim.create(user);
      let comment = await Comment.apiAdd(Claim, claimRev.claimId, user, FOO);
      let sourceRev = await TestSource.create(user);
      return request(app)
        .get('/api/activity')
        .expect(200, [{
          timestamp: sourceRev.created_at.toISOString(),
          username: user.username,
          action: 'added',
          type: ItemType.SOURCE,
          id: sourceRev.sourceId,
        }, {
          timestamp: comment.created_at.toISOString(),
          username: user.username,
          action: 'commented on',
          type: ItemType.CLAIM,
          id: claimRev.claimId,
        }, {
          timestamp: claimRev.created_at.toISOString(),
          username: user.username,
          action: 'added',
          type: ItemType.CLAIM,
          id: claimRev.claimId,
        }, {
          timestamp: topicRev.created_at.toISOString(),
          username: user.username,
          action: 'added',
          type: ItemType.TOPIC,
          id: topicRev.topicId,
        }]);
    });

    it('lifecycle', async function () {
      let r1 = await TestClaim.create(user);
      let claimId = r1.claimId;
      let r2 = await Claim.apiUpdate(claimId, user, {
        baseRev: r1.id,
        text: BAR,
      });
      let r3 = await Claim.apiDelete(claimId, user, 'is for test');
      return request(app)
        .get('/api/activity')
        .expect(200, [{
          timestamp: r3.created_at.toISOString(),
          username: user.username,
          action: 'deleted',
          type: ItemType.CLAIM,
          id: claimId,
        }, {
          timestamp: r2.created_at.toISOString(),
          username: user.username,
          action: 'edited',
          type: ItemType.CLAIM,
          id: claimId,
        }, {
          timestamp: r1.created_at.toISOString(),
          username: user.username,
          action: 'added',
          type: ItemType.CLAIM,
          id: claimId,
        }]);
    });
  });
});
