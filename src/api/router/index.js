import bodyParser from 'body-parser';
import Router from 'express-promise-router';

import { apiErrorHandler } from '@/api/error';
import { ItemType } from '@/common/constants';

import { createAuthRouter } from './auth';
import { createItemRouter } from './item';
import { createNotificationRouter } from './notifications';

export function createApiRouter(createApiFromAuthToken) {
  const router = Router();
  router.use(bodyParser.json());
  router.use((req, res, next) => {
    req.api = createApiFromAuthToken(req.session.authToken);
    next();
  });

  router.use(createAuthRouter());
  router.use('/claim', createItemRouter(ItemType.CLAIM));
  router.use('/notifications', createNotificationRouter());
  router.use('/source', createItemRouter(ItemType.SOURCE));
  router.use('/topic', createItemRouter(ItemType.TOPIC));

  router.get('/activity', async function(req, res) {
    const data = await req.api.getActivity();
    res.json(data);
  });

  router.get('/search', async function(req, res) {
    const data = await req.api.search(
      req.query.query,
      req.query.types,
      req.query.page
    );
    res.json(data);
  });

  router.get('/user/:username', async function(req, res) {
    const data = await req.api.getUser(req.params.username);
    res.json(data);
  });

  router.use(apiErrorHandler);
  return router;
}
