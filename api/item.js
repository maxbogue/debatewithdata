import Router from 'express-promise-router';

import { Claim, Source, Topic } from '../models';
import { NotFoundError } from './error';

const router = Router();

async function getData(promise) {
  try {
    return await promise;
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }
  return null;
}

router.get('/:id', async function (req, res) {
  let id = req.params.id;
  let data = null;

  data = await getData(Claim.apiGet(id, req.user));
  if (!data) {
    data = await getData(Source.apiGet(id));
  }
  if (!data) {
    data = await getData(Topic.apiGet(id, req.user));
  }
  if (data) {
    res.json(data);
  } else {
    throw new NotFoundError('No item found with that ID.');
  }
});

export default router;
