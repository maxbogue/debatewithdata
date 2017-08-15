import bodyParser from 'body-parser';
import express from 'express';

import claim from './claim';
import source from './source';
import user from './user';

const router = express.Router();

router.use(bodyParser.json());

router.use(user);
router.use('/claim', claim);
router.use('/source', source);

export default router;
