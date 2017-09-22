import express from 'express';

import { Point } from '../models';
import { AuthError } from './error';

const router = express.Router();

router.post('/:id/star', async function (req, res) {
  if (!req.user) {
    throw new AuthError();
  }
  let star = await Point.apiToggleStar(req.params.id, req.user);
  res.json({ star });
});

export default router;
