import Router from 'express-promise-router';
import bodyParser from 'body-parser';

import { ItemType } from '@/common/constants';
import { apiErrorHandler } from '@/api/error';

import { createAuthRouter } from './auth';
import { createItemRouter } from './item';
import { createNotificationRouter } from './notifications';

export function createApiRouter(api) {
  const router = Router();
  router.use(bodyParser.json());

  router.use(createAuthRouter(api));
  router.use('/claim', createItemRouter(api, ItemType.CLAIM));
  router.use('/notifications', createNotificationRouter(api));
  router.use('/source', createItemRouter(api, ItemType.SOURCE));
  router.use('/topic', createItemRouter(api, ItemType.TOPIC));

  router.get('/activity', async function (req, res) {
    const data = await api.getActivity();
    res.json(data);
  });

  router.get('/search', async function (req, res) {
    const data = await api.search(
      req.session.authToken, req.query.query, req.query.types, req.query.page);
    res.json(data);
  });

  router.get('/user/:username', async function (req, res) {
    const data = await api.getUser(req.params.username);
    res.json(data);
  });

  router.use(apiErrorHandler);
  return router;
}
