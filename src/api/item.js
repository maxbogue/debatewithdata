import Router from 'express-promise-router';

import { AuthError } from './error';
import { Comment } from '../models';
import { addApiData, getTrailData } from '../models/utils';
import { parseFilters, parseSort } from './utils';

const router = Router();

router.get('/', async function (req, res) {
  let data = await req.Item.apiGetAll({
    user: req.user,
    filters: parseFilters(req.query.filter),
    sort: parseSort(req.query.sort),
    page: parseInt(req.query.page),
  });
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await req.Item.apiCreate(req.user, req.body);
  let data = await req.Item.apiGet(rev.getItemId(), req.user);
  data.id = rev.getItemId();
  res.json(data);
});

router.get('/:id', async function (req, res) {
  let trail = req.query.trail;
  let data = await getTrailData(trail, req.user);
  let itemData = await req.Item.apiGet(req.params.id, req.user, Boolean(trail));
  addApiData(data, itemData);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await req.Item.apiUpdate(req.params.id, req.user, req.body);
  let data = await req.Item.apiGet(req.params.id, req.user);
  res.json(data);
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await req.Item.apiDelete(req.params.id, req.user, req.query.message);
  let data = await req.Item.apiGet(req.params.id, req.user);
  res.json(data);
});

router.get('/:id/rev', async function (req, res) {
  let data = await req.Item.apiGetRevs(req.params.id, req.user);
  res.json(data);
});

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let data = await req.Item.apiToggleStar(req.params.id, req.user);
  res.json(data);
});

router.post('/:id/watch', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let data = await req.Item.apiToggleWatch(req.params.id, req.user);
  res.json(data);
});

router.get('/:id/comment', async function (req, res) {
  let data = await Comment.apiGetAll(req.Item, req.params.id);
  res.json(data);
});

router.post('/:id/comment', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let comment = await Comment.apiAdd(
    req.Item, req.params.id, req.user, req.body.text);
  let data = await Comment.apiGet(comment.id);
  res.json({ comment: data });
});

router.delete('/:id/comment/:commentId', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await Comment.apiDelete(
    req.Item, req.params.id, req.user, req.params.commentId);
  res.json({ message: 'success' });
});

export default router;
