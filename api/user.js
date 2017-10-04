import Router from 'express-promise-router';

import { User } from '../models';
import { AuthError } from './error';

const AUTH_HEADER_REGEX = /^Bearer (.+)$/;

// A middleware that parses the authorization request header and sets req.user
// if it is valid.
export async function parseAuthHeader(req, res, next) {
  if (req.headers.authorization) {
    let match = req.headers.authorization.match(AUTH_HEADER_REGEX);
    if (!match) {
      throw new AuthError('Malformed auth token.');
    }
    let user = await User.verifyToken(match[1]);
    req.user = user;
  }
  next();
}

const router = Router();

router.post('/login', async function (req, res) {
  let user = await User.login(req.body.username, req.body.password);
  res.json({ authToken: user.genAuthToken() });
});

router.post('/register', async function (req, res) {
  let user = await User.register(
      req.body.username, req.body.password, req.body.email);
  res.json({ authToken: user.genAuthToken() });
});

export default router;

