import Router from 'express-promise-router';

export function createAuthRouter(api) {
  const router = Router();

  router.post('/login', async function (req, res) {
    req.session.authToken = await api.login(
      req.body.username, req.body.password);
    res.end();
  });

  router.post('/register', async function (req, res) {
    const data = await api.register(
      req.body.username, req.body.password, req.body.email);
    res.json(data);
  });

  router.post('/verify-email', async function (req, res) {
    req.session.authToken = await api.verifyEmail(req.body.token);
    res.end();
  });

  router.post('/forgot-password', async function (req, res) {
    const data = await api.forgotPassword(req.body.email);
    res.json(data);
  });

  router.post('/reset-password', async function (req, res) {
    req.session.authToken = await api.resetPassword(
      req.body.token, req.body.password);
    res.end();
  });

  return router;
}
