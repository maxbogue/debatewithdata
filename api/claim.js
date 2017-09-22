import express from 'express';

import { Claim } from '../models';
import { AuthError } from './error';

const router = express.Router();

router.get('/', async function (req, res) {
  let data = await Claim.apiGetAll();
  res.json(data);
});

router.post('/', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiCreate(req.user, req.body);
  let data = await Claim.apiGet(rev.claim_id);
  res.json({
    id: rev.claim_id,
    claim: data,
  });
});

router.get('/:id', async function (req, res) {
  let data = await Claim.apiGet(req.params.id);
  res.json(data);
});

router.put('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiUpdate(req.params.id, req.user, req.body);
  let data = Claim.apiGet(rev.claim_id);
  res.json({ claim: data });
});

router.delete('/:id', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let rev = await Claim.apiDelete(req.params.id, req.user);
  let data = Claim.apiGet(rev.claim_id);
  res.json({ claim: data });
});

router.get('/:id/star', async function (req, res) {
  let claimStars = await Claim.apiGetStars(req.params.id, req.user);
  res.json(claimStars);
});

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let star = await Claim.apiToggleStar(req.params.id, req.user);
  res.json({ star });
});

export default router;
