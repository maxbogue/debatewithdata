import Router from 'express-promise-router';

import { User } from '../models';
import { getActivity } from './activity';

const router = Router();

router.get('/:username', async function (req, res) {
  let user = await User.findOne({
    where: { username: req.params.username },
  });
  let activity = await getActivity({ user, limit: 100 });
  res.json({
    createdAt: user.created_at,
    admin: user.admin,
    activity,
  });
});

export default router;
