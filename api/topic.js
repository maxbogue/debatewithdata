import Router from 'express-promise-router';

import { AuthError } from './error';
import { Comment, Topic } from '../models';
import { addApiData, getTrailData } from '../models/utils';
import { parseFilters, parseSort } from './utils';

const router = Router();

router.get('/', async function (req, res) {
  let data = await Topic.apiGetRoots({
    user: req.user,
    filters: parseFilters(req.query.filter),
    sort: parseSort(req.query.sort),
  });
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user || !req.user.admin) {
    throw new AuthError('Must be authenticated as an admin user.');
  }
  let rev = await Topic.apiCreate(req.user, req.body, true);
  let data = await Topic.apiGet(rev.topicId, req.user);
  data.id = rev.topicId;
  res.json(data);
});

router.get('/:id', async function (req, res) {
  let data = await getTrailData(req.query.trail, req.user);
  let topicData = await Topic.apiGet(req.params.id, req.user);
  addApiData(data, topicData);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Topic.apiUpdate(req.params.id, req.user, req.body);
  let data = await Topic.apiGet(rev.topicId, req.user);
  res.json(data);
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Topic.apiDelete(req.params.id, req.user, req.query.message);
  let data = await Topic.apiGet(rev.topicId, req.user);
  res.json(data);
});

router.get('/:id/rev', async function (req, res) {
  let data = await Topic.apiGetRevs(req.params.id);
  res.json(data);
});

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let star = await Topic.apiToggleStar(req.params.id, req.user);
  res.json(star);
});

router.get('/:id/comment', async function (req, res) {
  let data = await Comment.apiGetAll(Topic, req.params.id);
  res.json(data);
});

router.post('/:id/comment', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let comment = await Comment.apiAdd(
      Topic, req.params.id, req.user, req.body.text);
  let data = await Comment.apiGet(comment.id);
  res.json({ comment: data });
});

router.delete('/:id/comment/:commentId', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  await Comment.apiDelete(
      Topic, req.params.id, req.user, req.params.commentId);
  res.json({ message: 'success' });
});

export default router;
