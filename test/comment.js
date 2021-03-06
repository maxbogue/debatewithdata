import chai from 'chai';

import { ItemType } from '@/common/constants';
import { Claim, Comment } from '@/models';

import { BAR, BAZ, FOO, registerAndVerifyUser } from './utils';

const expect = chai.expect;

describe('Comment', function() {
  let user;
  let claimId;

  beforeEach(async function() {
    user = await registerAndVerifyUser();
    const claimRev = await Claim.apiCreate(user, { text: BAZ });
    claimId = claimRev.claimId;
  });

  describe('.apiAdd()', function() {
    it('happy', async function() {
      const comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      expect(comment.userId).to.equal(user.id);
      expect(comment.commentable).to.equal(ItemType.CLAIM);
      expect(comment.commentableId).to.equal(claimId);
      expect(comment.text).to.equal(FOO);
      expect(comment.deleted).to.be.false;
    });
  });

  describe('.apiDelete()', function() {
    it('happy', async function() {
      const comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiDelete(Claim, claimId, user, comment.id);
      await comment.reload();
      expect(comment.deleted).to.be.true;
    });
  });

  describe('.apiGet()', function() {
    it('happy', async function() {
      const comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      const commentData = await Comment.apiGet(comment.id);
      expect(commentData).to.deep.equal({
        id: comment.id,
        text: FOO,
        author: user.username,
        created: comment.createdAt,
      });
    });
  });

  describe('.apiGetAll()', function() {
    it('happy', async function() {
      await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiAdd(Claim, claimId, user, BAR);
      const commentsData = await Comment.apiGetAll(Claim, claimId);
      expect(commentsData).to.have.lengthOf(2);
      expect(commentsData[0].text).to.equal(FOO);
      expect(commentsData[1].text).to.equal(BAR);
    });

    it('excludes deleted', async function() {
      const comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiDelete(Claim, claimId, user, comment.id);
      const commentsData = await Comment.apiGetAll(Claim, claimId);
      expect(commentsData).to.have.lengthOf(0);
    });
  });
});
