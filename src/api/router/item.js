import Router from 'express-promise-router';

import { parseFilters, parseSort } from './utils';

export function createItemRouter(api, type) {
  const router = Router();

  router.get('/', async function (req, res) {
    const data = await api.getItems(
      req.session.authToken,
      type,
      parseFilters(req.query.filter),
      parseSort(req.query.sort),
      parseInt(req.query.page),
    );
    res.json(data);
  });

  router.post('/', async function (req, res) {
    const data = await api.createItem(req.session.authToken, type, req.body);
    res.json(data);
  });

  router.get('/:id', async function (req, res) {
    const data = await api.getItem(
      req.session.authToken, type, req.params.id, req.query.trail);
    res.json(data);
  });

  router.put('/:id', async function (req, res) {
    const data = await api.updateItem(
      req.session.authToken, type, req.params.id, req.body);
    res.json(data);
  });

  router.delete('/:id', async function (req, res) {
    const data = await api.deleteItem(
      req.session.authToken, type, req.params.id, req.query.message);
    res.json(data);
  });

  router.get('/:id/rev', async function (req, res) {
    const data = await api.getItemRevs(
      req.session.authToken, type, req.params.id, req.user);
    res.json(data);
  });

  router.post('/:id/star', async function (req, res) {
    const data = await api.toggleStar(
      req.session.authToken, type, req.params.id);
    res.json(data);
  });

  router.post('/:id/watch', async function (req, res) {
    const data = await api.toggleWatch(
      req.session.authToken, type, req.params.id);
    res.json(data);
  });

  router.get('/:id/comment', async function (req, res) {
    const data = await api.getComments(type, req.params.id);
    res.json(data);
  });

  router.post('/:id/comment', async function (req, res) {
    const data = await api.createComment(
      req.session.authToken, type, req.params.id, req.body.text);
    res.json(data);
  });

  router.delete('/:id/comment/:commentId', async function (req, res) {
    const data = await api.deleteComment(
      req.session.authToken, type, req.params.id, req.params.commentId);
    res.json(data);
  });

  return router;
}
