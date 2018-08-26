import Router from 'express-promise-router';

export function createNotificationRouter() {
  const router = Router();

  router.get('/', async function(req, res) {
    const data = await req.api.getNotifications();
    res.json(data);
  });

  router.get('/has', async function(req, res) {
    const data = await req.api.hasNotifications();
    res.json(data);
  });

  router.post('/read', async function(req, res) {
    const data = await req.api.readNotifications(req.body.until);
    res.json(data);
  });

  return router;
}
