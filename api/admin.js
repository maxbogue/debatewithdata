import Router from 'express-promise-router';
import map from 'lodash/map';

import { Invite } from '../models';
import { AuthError } from './error';

const router = Router();

router.use(function (req, res, next) {
  if (!req.user || !req.user.admin) {
    throw new AuthError('Must be authenticated as an admin user.');
  }
  next();
});

router.get('/invite', async function (req, res) {
  let invites = await Invite.findAll(Invite.INCLUDE_USER);
  res.json(map(invites, (i) => i.toData()));
});

router.post('/invite', async function (req, res) {
  let invite = await Invite.create({ note: req.body.note });
  res.json(invite.toData());
});

export default router;
