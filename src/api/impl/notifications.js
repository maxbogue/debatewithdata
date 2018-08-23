import sortBy from 'lodash/sortBy';

import q from '@/models/query';
import { ItemType } from '@/common/constants';
import { AuthError, ClientError } from '@/api/error';
import { knex, Claim, Source, Topic } from '@/models';

function getUpdated(query, until) {
  query
    .column({
      updatedAt: 'h.created_at',
      deleted: 'h.deleted',
      deleteMessage: 'h.delete_message',
    })
    .where('h.created_at', '<', until)
    .where('w.watched', true);
}

export async function getNotifications(user) {
  if (!user) {
    throw new AuthError();
  }

  let until = new Date();

  let queries = [Topic, Claim, Source].map((Item) => Item
    .itemQuery(user)
    .modify(getUpdated, until)
    .limit(100));

  let [topicResults, claimResults, sourceResults] = await Promise.all(queries);

  let items = sortBy([
    ...topicResults.map((item) => ({ type: ItemType.TOPIC, item })),
    ...claimResults.map((item) => ({ type: ItemType.CLAIM, item })),
    ...sourceResults.map((item) => ({ type: ItemType.SOURCE, item })),
  ], 'item.updatedAt');

  items = items
    .slice(0, 100)
    .map(({ type, item }) => ({ type, id: item.id }))
    .reverse();

  return {
    topics: Topic.processQueryResults(topicResults),
    claims: Claim.processQueryResults(claimResults),
    sources: Source.processQueryResults(sourceResults),
    results: {
      items,
      until,
      readUntil: user.caughtUpAt,
    },
  };
}

export async function hasNotifications(user) {
  let queries = [ItemType.TOPIC, ItemType.CLAIM, ItemType.SOURCE]
    .map((type) => knex.queryBuilder().exists({
      exists: q.base(type)
        .modify(q.joinWatched, type, user)
        .modify(getUpdated, new Date())
        .where('h.created_at', '>', user.caughtUpAt),
    }));
  let results = await Promise.all(queries);
  return results.reduce((acc, [{ exists }]) => acc || exists, false);
}