import Router from 'express-promise-router';

import { parseFilters, parseSort } from './utils';

export function createItemRouter(type) {
  const router = Router();

  router.get('/', async function (req, res) {
    const data = await req.api.getItems(
      type,
      parseFilters(req.query.filter),
      parseSort(req.query.sort),
      parseInt(req.query.page),
    );
    res.json(data);
  });

  router.post('/', async function (req, res) {
    const data = await req.api.createItem(type, req.body);
    res.json(data);
  });

  router.get('/:id', async function (req, res) {
    const trail = req.query.trail ? req.query.trail.split(',') : [];
    const data = await req.api.getItem(type, req.params.id, trail);
    res.json(data);
  });

  router.put('/:id', async function (req, res) {
    const data = await req.api.updateItem(type, req.params.id, req.body);
    res.json(data);
  });

  router.delete('/:id', async function (req, res) {
    const data = await req.api.deleteItem(
      type, req.params.id, req.query.message);
    res.json(data);
  });

  router.get('/:id/rev', async function (req, res) {
    const data = await req.api.getItemRevs(type, req.params.id, req.user);
    res.json(data);
  });

  router.post('/:id/star', async function (req, res) {
    const data = await req.api.toggleStar(type, req.params.id);
    res.json(data);
  });

  router.post('/:id/watch', async function (req, res) {
    const data = await req.api.toggleWatch(type, req.params.id);
    res.json(data);
  });

  router.get('/:id/comment', async function (req, res) {
    const data = await req.api.getComments(type, req.params.id);
    res.json(data);
  });

  router.post('/:id/comment', async function (req, res) {
    const data = await req.api.createComment(
      type, req.params.id, req.body.text);
    res.json(data);
  });

  router.delete('/:id/comment/:commentId', async function (req, res) {
    const data = await req.api.deleteComment(
      type, req.params.id, req.params.commentId);
    res.json(data);
  });

  return router;
}
