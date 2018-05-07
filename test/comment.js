import chai from 'chai';

import { Claim, Comment } from '../models';
import { ItemType } from '../common/constants';
import { FOO, BAR, BAZ, registerAndVerifyUser } from './utils';

const expect = chai.expect;

describe('Comment', function () {
  let user;
  let claimId;

  beforeEach(async function () {
    user = await registerAndVerifyUser();
    let claimRev = await Claim.apiCreate(user, { text: BAZ });
    claimId = claimRev.claimId;
  });

  describe('.apiAdd()', function () {
    it('happy', async function () {
      let comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      expect(comment.userId).to.equal(user.id);
      expect(comment.commentable).to.equal(ItemType.CLAIM);
      expect(comment.commentableId).to.equal(claimId);
      expect(comment.text).to.equal(FOO);
      expect(comment.deleted).to.be.false;
    });
  });

  describe('.apiDelete()', function () {
    it('happy', async function () {
      let comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiDelete(Claim, claimId, user, comment.id);
      await comment.reload();
      expect(comment.deleted).to.be.true;
    });
  });

  describe('.apiGet()', function () {
    it('happy', async function () {
      let comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      let commentData = await Comment.apiGet(comment.id);
      expect(commentData).to.deep.equal({
        id: comment.id,
        text: FOO,
        author: user.username,
        created: comment.created_at,
      });
    });
  });

  describe('.apiGetAll()', function () {
    it('happy', async function () {
      await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiAdd(Claim, claimId, user, BAR);
      let commentsData = await Comment.apiGetAll(Claim, claimId);
      expect(commentsData).to.have.lengthOf(2);
      expect(commentsData[0].text).to.equal(FOO);
      expect(commentsData[1].text).to.equal(BAR);
    });

    it('excludes deleted', async function () {
      let comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      await Comment.apiDelete(Claim, claimId, user, comment.id);
      let commentsData = await Comment.apiGetAll(Claim, claimId);
      expect(commentsData).to.have.lengthOf(0);
    });
  });
});

