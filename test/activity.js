import request from 'supertest';

import { ItemType } from '@/common/constants';
import { Claim, Comment } from '@/models';
import app from '@/server';

import {
  BAR,
  FOO,
  TestClaim,
  TestSource,
  TestTopic,
  registerAndVerifyUser,
} from './utils';

describe('Activity', function() {
  let user;

  beforeEach(async function() {
    user = await registerAndVerifyUser();
  });

  describe('get activity', function() {
    it('none', async function() {
      return request(app)
        .get('/api/activity')
        .expect(200, {
          activity: [],
        });
    });

    it('variety', async function() {
      const topicRev = await TestTopic.create(user);
      const claimRev = await TestClaim.create(user);
      const comment = await Comment.apiAdd(Claim, claimRev.claimId, user, FOO);
      const sourceRev = await TestSource.create(user);
      return request(app)
        .get('/api/activity')
        .expect(200, {
          activity: [
            {
              timestamp: sourceRev.created_at.toISOString(),
              username: user.username,
              action: 'added',
              type: ItemType.SOURCE,
              id: sourceRev.sourceId,
              revId: sourceRev.id,
            },
            {
              timestamp: comment.created_at.toISOString(),
              username: user.username,
              action: 'commented on',
              type: ItemType.CLAIM,
              id: claimRev.claimId,
            },
            {
              timestamp: claimRev.created_at.toISOString(),
              username: user.username,
              action: 'added',
              type: ItemType.CLAIM,
              id: claimRev.claimId,
              revId: claimRev.id,
            },
            {
              timestamp: topicRev.created_at.toISOString(),
              username: user.username,
              action: 'added',
              type: ItemType.TOPIC,
              id: topicRev.topicId,
              revId: topicRev.id,
            },
          ],
        });
    });

    it('lifecycle', async function() {
      const r1 = await TestClaim.create(user);
      const claimId = r1.claimId;
      const r2 = await Claim.apiUpdate(claimId, user, {
        baseRev: r1.id,
        text: BAR,
      });
      const r3 = await Claim.apiDelete(claimId, user, 'is for test');
      return request(app)
        .get('/api/activity')
        .expect(200, {
          activity: [
            {
              timestamp: r3.created_at.toISOString(),
              username: user.username,
              action: 'deleted',
              type: ItemType.CLAIM,
              id: claimId,
              revId: r3.id,
            },
            {
              timestamp: r2.created_at.toISOString(),
              username: user.username,
              action: 'edited',
              type: ItemType.CLAIM,
              id: claimId,
              revId: r2.id,
            },
            {
              timestamp: r1.created_at.toISOString(),
              username: user.username,
              action: 'added',
              type: ItemType.CLAIM,
              id: claimId,
              revId: r1.id,
            },
          ],
        });
    });
  });
});
