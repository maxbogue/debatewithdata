import Router from 'express-promise-router';
import bodyParser from 'body-parser';

import activity from './activity';
import admin from './admin';
import auth, { parseAuthHeader } from './auth';
import item from './item';
import notifications from './notifications';
import search from './search';
import user from './user';
import { Claim, Source, Topic } from '../models';
import { apiErrorHandler } from './error';

const router = Router();

router.use(bodyParser.json());
router.use(parseAuthHeader);

function setItem(Item) {
  return (req, res, next) => {
    req.Item = Item;
    next();
  };
}

router.use(auth);
router.use('/activity', activity);
router.use('/admin', admin);
router.use('/claim', setItem(Claim), item);
router.use('/notifications', notifications);
router.use('/search', search);
router.use('/source', setItem(Source), item);
router.use('/topic', setItem(Topic), item);
router.use('/user', user);

router.use(apiErrorHandler);

export default router;
