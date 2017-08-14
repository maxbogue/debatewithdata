import express from 'express';

import claim from './claim';
import source from './source';

const router = express.Router();

router.use('/claim', claim);
router.use('/source', source);

export default router;
