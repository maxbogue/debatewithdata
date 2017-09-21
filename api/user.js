import express from 'express';

import { User } from '../models';
import { ClientError } from './error';

const AUTH_HEADER_REGEX = /^Bearer (.+)$/;

// A middleware that parses the authorization request header and sets req.user
// if it is valid.
export function parseAuthHeader(req, res, next) {
  if (req.headers.authorization) {
    let match = req.headers.authorization.match(AUTH_HEADER_REGEX);
    if (!match) {
      throw new ClientError('Bad auth token.');
    }
    User.verifyToken(match[1]).then((u) => {
      if (!u) {
        throw new ClientError('User not found.');
      }
      req.user = u;
      next();
    }).catch(next);
  } else {
    next();
  }
}

const router = express.Router();

router.post('/login', function (req, res, next) {
  User.login(req.body.username, req.body.password).then((user) => {
    res.json({ authToken: user.genAuthToken() });
  }).catch(next);
});

router.post('/register', function (req, res, next) {
  User.register(req.body.username, req.body.password, req.body.email)
    .then((user) => {
      res.json({ authToken: user.genAuthToken() });
    }).catch(next);
});

export default router;

