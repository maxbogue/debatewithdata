import Router from 'express-promise-router';

export function createNotificationRouter(api) {
  const router = Router();

  router.get('/', async function (req, res) {
    const data = await api.getNotifications(req.session.authToken);
    res.json(data);
  });

  router.get('/has', async function (req, res) {
    const data = await api.hasNotifications(req.session.authToken);
    res.json(data);
  });

  router.post('/read', async function (req, res) {
    const data = await api.readNotifications(
      req.session.authToken, req.body.until);
    res.json(data);
  });

  return router;
}
