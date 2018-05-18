import Router from 'express-promise-router';

import search from '../common/search';
import { Claim, Source, Topic } from '../models';
import { ClientError } from './error';
import { ItemType } from '../common/constants';

const router = Router();

// All IDs only use lowercase letters, numbers, and dashes.
const ANY_ID_REGEX = /^[0-9a-z-]+$/;

router.get('/', async function (req, res) {
  let query = req.query.query;
  if (!query) {
    throw new ClientError('search requires a query');
  }

  let results = search.query(query, req.query.types);
  let limit = Number(req.query.limit);
  if (limit) {
    results = results.slice(0, limit);
  }

  let data = { results, topics: {}, claims: {}, sources: {} };
  let maybeId = ANY_ID_REGEX.test(query);

  let topicItems = results.filter((item) => item.type === ItemType.TOPIC);
  if (topicItems.length > 0 || maybeId) {
    let topicIds = topicItems.map((item) => item.id);
    if (maybeId) {
      topicIds.push(query);
    }
    let topics = await Topic.findAll({
      where: { id: topicIds },
      ...Topic.INCLUDE(1),
    });
    for (let topic of topics) {
      if (!topic.head.deleted) {
        await topic.fillData(data, 1, req.user);
      }
    }
  }

  let claimItems = results.filter((item) => item.type === ItemType.CLAIM);
  if (claimItems.length > 0 || maybeId) {
    let claimIds = claimItems.map((item) => item.id);
    if (maybeId) {
      claimIds.push(query);
    }
    let claims = await Claim.findAll({
      where: { id: claimIds },
      ...Claim.INCLUDE(1),
    });
    for (let claim of claims) {
      if (!claim.head.deleted) {
        await claim.fillData(data, 1, req.user);
      }
    }
  }

  let sourceItems = results.filter((item) => item.type === ItemType.SOURCE);
  if (sourceItems.length > 0 || maybeId) {
    let sourceIds = sourceItems.map((item) => item.id);
    if (maybeId) {
      sourceIds.push(query);
    }
    let sources = await Source.findAll({
      where: { id: sourceIds },
      ...Source.INCLUDE(1),
    });
    for (let source of sources) {
      if (!source.head.deleted) {
        data.sources[source.id] = await source.toData(req.user);
      }
    }
  }

  res.json(data);
});

export default router;
