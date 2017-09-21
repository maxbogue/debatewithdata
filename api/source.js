import express from 'express';

import { Source } from '../models';
import { AuthError } from './error';

const router = express.Router();

router.get('/', async function (req, res) {
  let data = await Source.apiGetAll();
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiCreate(req.user, req.body);
  let data = await Source.apiGet(rev.source_id);
  res.json({
    id: rev.source_id,
    source: data,
  });
});

router.get('/:id', async function (req, res) {
  let data = await Source.apiGet(req.params.id);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiUpdate(req.params.id, req.user, req.body);
  let data = Source.apiGet(rev.source_id);
  res.json({ source: data });
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Source.apiDelete(req.params.id, req.user);
  let data = Source.apiGet(rev.source_id);
  res.json({ source: data });
});

export default router;
