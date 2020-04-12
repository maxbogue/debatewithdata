import Router from 'express-promise-router';

export function createAuthRouter() {
  const router = Router();

  router.post('/login', async function (req, res) {
    req.session.authToken = await req.api.login(
      req.body.username,
      req.body.password
    );
    res.end();
  });

  router.post('/register', async function (req, res) {
    const data = await req.api.register(
      req.body.username,
      req.body.password,
      req.body.email
    );
    res.json(data);
  });

  router.post('/verify-email', async function (req, res) {
    req.session.authToken = await req.api.verifyEmail(req.body.token);
    res.end();
  });

  router.post('/forgot-password', async function (req, res) {
    const data = await req.api.forgotPassword(req.body.email);
    res.json(data);
  });

  router.post('/reset-password', async function (req, res) {
    req.session.authToken = await req.api.resetPassword(
      req.body.token,
      req.body.password
    );
    res.end();
  });

  return router;
}
