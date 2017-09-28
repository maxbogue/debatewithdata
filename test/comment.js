import chai from 'chai';

import { sequelize, Claim, Comment } from '../models';
import utils from './utils';

const expect = chai.expect;

const FOO = 'foo';
const BAR = 'bar';
const BAZ = 'baz';

describe('Comment', function () {
  let user;
  let claimId;

  beforeEach(async function () {
    await sequelize.sync({ force: true });
    user = await utils.createUser();
    let claimRev = await Claim.apiCreate(user, { text: BAZ });
    claimId = claimRev.claim_id;
  });

  describe('.apiAdd()', function () {
    it('happy', async function () {
      let comment = await Comment.apiAdd(Claim, claimId, user, FOO);
      expect(comment.user_id).to.equal(user.id);
      expect(comment.commentable).to.equal('claim');
      expect(comment.commentable_id).to.equal(claimId);
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
        created: Math.floor(comment.created_at.getTime() / 1000),
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

