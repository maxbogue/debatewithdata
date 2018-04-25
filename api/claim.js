import Router from 'express-promise-router';

import { AuthError } from './error';
import { Claim, Comment } from '../models';
import { addApiData, getTrailData } from '../models/utils';

const router = Router();

router.get('/', async function (req, res) {
  let data = await Claim.apiGetAll(req.user);
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiCreate(req.user, req.body);
  let data = await Claim.apiGet(rev.claimId, req.user);
  data.id = rev.claimId;
  res.json(data);
});

router.get('/:id', async function (req, res) {
  let data = await getTrailData(req.query.trail, req.user);
  let claimData = await Claim.apiGet(req.params.id, req.user);
  addApiData(data, claimData);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiUpdate(req.params.id, req.user, req.body);
  let data = await Claim.apiGet(rev.claimId, req.user);
  res.json(data);
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiDelete(req.params.id, req.user, req.query.message);
  let data = await Claim.apiGet(rev.claimId, req.user);
  res.json(data);
});

router.get('/:id/rev', async function (req, res) {
  let data = await Claim.apiGetRevs(req.params.id, req.user);
  res.json(data);
});

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let star = await Claim.apiToggleStar(req.params.id, req.user);
  res.json({ star });
});

router.get('/:id/comment', async function (req, res) {
  let data = await Comment.apiGetAll(Claim, req.params.id);
  res.json(data);
});

router.post('/:id/comment', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let comment = await Comment.apiAdd(
      Claim, req.params.id, req.user, req.body.text);
  let data = await Comment.apiGet(comment.id);
  res.json({ comment: data });
});

router.delete('/:id/comment/:commentId', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await Comment.apiDelete(
      Claim, req.params.id, req.user, req.params.commentId);
  res.json({ message: 'success' });
});

export default router;
