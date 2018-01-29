import Router from 'express-promise-router';

import { Claim, Source } from '../models';
import { NotFoundError } from './error';

const router = Router();

router.get('/:id', async function (req, res) {
  try {
    let data = await Claim.apiGet(req.params.id, req.user);
    res.json(data);
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      return Promise.reject(err);
    }
  }
  try {
    let data = await Source.apiGet(req.params.id);
    res.json(data);
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      return Promise.reject(err);
    }
  }
  throw new NotFoundError('No claim or source with that ID found.');
});

export default router;
