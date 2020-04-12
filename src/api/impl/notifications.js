import _ from 'lodash/fp';

import { AuthError } from '@/api/error';
import { ItemType } from '@/common/constants';
import { Claim, knex, Source, Topic } from '@/models';
import q from '@/models/query';

function getUpdated(query, until) {
  query.where('h.created_at', '<', until).where('w.watched', true).limit(100);
}

const Items = [Topic, Claim, Source];

export async function getNotifications(user) {
  if (!user) {
    throw new AuthError();
  }

  const until = new Date();

  const queries = Items.map(Item =>
    Item.itemQuery(user, query => query.modify(getUpdated, until))
  );

  const itemResults = await Promise.all(queries);
  const [topics, claims, sources] = _.zip(
    Items,
    itemResults
  ).map(([Item, flatItems]) => Item.processQueryResults(flatItems));

  const items = _.sortBy('item.updatedAt', [
    ...topics.map(item => ({ type: ItemType.TOPIC, item })),
    ...claims.map(item => ({ type: ItemType.CLAIM, item })),
    ...sources.map(item => ({ type: ItemType.SOURCE, item })),
  ])
    .slice(0, 100)
    .map(({ type, item }) => ({ type, id: item.id }))
    .reverse();

  return {
    topics: _.keyBy('id', topics),
    claims: _.keyBy('id', claims),
    sources: _.keyBy('id', sources),
    results: {
      items,
      until,
      readUntil: user.caughtUpAt,
    },
  };
}

export async function hasNotifications(user) {
  const queries = [ItemType.TOPIC, ItemType.CLAIM, ItemType.SOURCE].map(type =>
    knex.queryBuilder().exists({
      exists: q
        .base(type)
        .modify(q.joinWatched, type, user)
        .modify(getUpdated, new Date())
        .where('h.created_at', '>', user.caughtUpAt),
    })
  );
  const results = await Promise.all(queries);
  return results.reduce((acc, [{ exists }]) => acc || exists, false);
}
