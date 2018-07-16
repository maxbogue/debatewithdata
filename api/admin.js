import Router from 'express-promise-router';
import clone from 'lodash/clone';
import forOwn from 'lodash/forOwn';

import { Topic } from '../models';
import { AuthError } from './error';
import { asyncForOwn } from '../common/utils';

const router = Router();

router.use(function (req, res, next) {
  if (!req.user || !req.user.admin) {
    throw new AuthError('Must be authenticated as an admin user.');
  }
  next();
});

function getRootTopics(topics) {
  let rootTopics = clone(topics);
  forOwn(topics, (topic) => {
    if (topic.subTopicIds) {
      for (let subTopicId of topic.subTopicIds) {
        delete rootTopics[subTopicId];
      }
    }
  });
  return rootTopics;
}

router.post('/fix/topic-roots', async function (req, res) {
  let data = await Topic.apiGetAll();
  let rootTopics = getRootTopics(data.topics);
  let count = 0;
  await asyncForOwn(rootTopics, (rootTopic) => {
    count += 1;
    return Topic.apiSetIsRoot(rootTopic.id, true);
  });
  res.json({ count });
});

export default router;
