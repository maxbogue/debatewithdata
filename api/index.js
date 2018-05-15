import Router from 'express-promise-router';
import bodyParser from 'body-parser';

import { apiErrorHandler } from './error';
import activity from './activity';
import admin from './admin';
import auth, { parseAuthHeader } from './auth';
import claim from './claim';
import item from './item';
import source from './source';
import topic from './topic';
import user from './user';

const router = Router();

router.use(bodyParser.json());
router.use(parseAuthHeader);

router.use(auth);
router.use('/activity', activity);
router.use('/admin', admin);
router.use('/claim', claim);
router.use('/item', item);
router.use('/data', source);
router.use('/topic', topic);
router.use('/user', user);

router.use(apiErrorHandler);

export default router;
