import Router from 'express-promise-router';
import sortBy from 'lodash/sortBy';

import q from '../models/query';
import { ItemType } from '../common/constants';
import { AuthError } from './error';
import { Claim, Source, Topic } from '../models';

const router = Router();

function getUpdated(query, user, timestamp) {
  query
    .column({ updatedAt: 'h.created_at' })
    .where('h.created_at', '>', user.caughtUpAt)
    .where('h.created_at', '<', timestamp)
    .where('w.watched', true);
}

router.get('/', async function (req, res) {
  let user = req.user;
  if (!user) {
    throw new AuthError();
  }

  let timestamp = new Date();

  let topicQuery = Topic.itemQuery(user).modify(getUpdated, user, timestamp);
  let claimQuery = Claim.itemQuery(user).modify(getUpdated, user, timestamp);
  let sourceQuery = Source.itemQuery(user).modify(getUpdated, user, timestamp);

  let [topicResults, claimResults, sourceResults] =
    await Promise.all([topicQuery, claimQuery, sourceQuery]);

  let results = sortBy([
    ...topicResults.map((item) => ({ type: ItemType.TOPIC, item })),
    ...claimResults.map((item) => ({ type: ItemType.CLAIM, item })),
    ...sourceResults.map((item) => ({ type: ItemType.SOURCE, item })),
  ], 'item.updatedAt').map(({ type, item }) => ({ type, id: item.id }));
  results.reverse();

  await user.update({ caughtUpAt: timestamp });

  res.json({
    topics: Topic.processQueryResults(topicResults),
    claims: Claim.processQueryResults(claimResults),
    sources: Source.processQueryResults(sourceResults),
    results,
  });
});

router.get('/count', async function (req, res) {
  let user = req.user;
  if (!user) {
    throw new AuthError();
  }

  let timestamp = new Date();

  let queries = [Topic, Claim, Source].map((Item) => Item
    .itemQuery(user)
    .modify(getUpdated, user, timestamp)
    .modify(q.count));

  let results = await Promise.all(queries);
  let totalCount = results.reduce((acc, [{ count }]) => acc + count, 0);
  res.json(totalCount);
});

export default router;
