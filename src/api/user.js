import Router from 'express-promise-router';

import { NotFoundError } from './error';
import { User } from '../models';
import { getActivity } from './activity';

const router = Router();

router.get('/:username', async function (req, res) {
  let username = req.params.username;
  let user = await User.findOne({
    where: { username },
  });
  if (!user) {
    throw new NotFoundError(`User not found: "${username}"`);
  }
  let activity = await getActivity({ user, limit: 100 });
  res.json({
    createdAt: user.created_at,
    admin: user.admin,
    activity,
  });
});

export default router;
