import Router from 'express-promise-router';

import { Comment, Point } from '../models';
import { AuthError } from './error';

const router = Router();

router.get('/:id/claimId', async function (req, res) {
  let claimId = await Point.getClaimId(req.params.id);
  res.json({ claimId });
});

router.get('/:id/rev', async function (req, res) {
  let data = await Point.apiGetRevs(req.params.id);
  res.json(data);
});

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let star = await Point.apiToggleStar(req.params.id, req.user);
  res.json({ star });
});

router.get('/:id/comment', async function (req, res) {
  let data = await Comment.apiGetAll(Point, req.params.id);
  res.json(data);
});

router.post('/:id/comment', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let comment = await Comment.apiAdd(
      Point, req.params.id, req.user, req.body.text);
  let data = await Comment.apiGet(comment.id);
  res.json({ comment: data });
});

router.delete('/:id/comment/:commentId', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await Comment.apiDelete(
      Point, req.params.id, req.user, req.params.commentId);
  res.json({ message: 'success' });
});

export default router;
