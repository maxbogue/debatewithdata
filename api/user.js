import express from 'express';

import User from '../models/user';

const router = express.Router();

router.post('/login', function (req, res) {
  User.login(req.body.username, req.body.password).then((user) => {
    res.json({ authToken: user.genAuthToken() });
  });
});

router.post('/register', function (req, res) {
  User.register(req.body.username, req.body.password, req.body.email)
    .then((user) => {
      res.json({ authToken: user.genAuthToken() });
    });
});

export default router;

