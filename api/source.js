import Router from 'express-promise-router';

import { AuthError } from './error';
import { Comment, Source } from '../models';
import { addApiData, getTrailData } from '../models/utils';

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
  data.id = rev.sourceId;
  res.json(data);
});

router.get('/:id', async function (req, res) {
  let data = await getTrailData(req.query.trail, req.user);
  let sourceData = await Source.apiGet(req.params.id);
  addApiData(data, sourceData);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let id = req.params.id;
  await Source.apiUpdate(id, req.user, req.body);
  let data = await Source.apiGet(id);
  res.json(data);
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiDelete(req.params.id, req.user, req.query.message);
  let data = await Source.apiGet(rev.sourceId);
  res.json(data);
});

router.get('/:id/rev', async function (req, res) {
  let data = await Source.apiGetRevs(req.params.id);
  res.json(data);
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
