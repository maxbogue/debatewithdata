import Router from 'express-promise-router';

import { Claim, Comment, Source } from '../models';
import { AuthError } from './error';

const router = Router();

router.get('/', async function (req, res) {
  let data = await Source.apiGetAll();
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiCreate(req.user, req.body);
  let data = await Source.apiGet(rev.sourceId);
  res.json({
    id: rev.sourceId,
    source: data,
  });
});

router.get('/:id', async function (req, res) {
  let data;
  if (req.query.trail) {
    let claimIds = req.query.trail.split(',');
    data = await Claim.apiGetAll(req.user, claimIds);
  } else {
    data = { sources: {} };
  }
  data.sources[req.params.id] = await Source.apiGet(req.params.id);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiUpdate(req.params.id, req.user, req.body);
  let data = await Source.apiGet(rev.sourceId);
  res.json({ source: data });
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiDelete(req.params.id, req.user);
  let data = await Source.apiGet(rev.sourceId);
  res.json({ source: data });
});

router.get('/:id/comment', async function (req, res) {
  let data = await Comment.apiGetAll(Source, req.params.id);
  res.json(data);
});

router.post('/:id/comment', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let comment = await Comment.apiAdd(
      Source, req.params.id, req.user, req.body.text);
  let data = await Comment.apiGet(comment.id);
  res.json({ comment: data });
});

router.delete('/:id/comment/:commentId', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await Comment.apiDelete(
      Source, req.params.id, req.user, req.params.commentId);
  res.json({ message: 'success' });
});

export default router;
