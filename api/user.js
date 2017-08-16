import express from 'express';

import { User } from '../models';

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

