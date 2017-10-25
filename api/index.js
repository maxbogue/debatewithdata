import Router from 'express-promise-router';
import bodyParser from 'body-parser';

import { apiErrorHandler } from './error';
import admin from './admin';
import claim from './claim';
import item from './item';
import point from './point';
import source from './source';
import user, { parseAuthHeader } from './user';

const router = Router();

router.use(bodyParser.json());
router.use(parseAuthHeader);

router.use(user);
router.use('/admin', admin);
router.use('/claim', claim);
router.use('/item', item);
router.use('/point', point);
router.use('/source', source);

router.use(apiErrorHandler);

export default router;
