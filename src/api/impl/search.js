import searchIndex from '@/common/search';
import { Claim, Source, Topic } from '@/models';
import { ClientError } from '@/api/error';
import { ItemType, PAGE_SIZE } from '@/common/constants';

// All IDs only use lowercase letters, numbers, and dashes.
const ANY_ID_REGEX = /^[0-9a-z-]+$/;

export async function search(user, query, types, page) {
  if (!query) {
    throw new ClientError('search requires a query');
  }

  let results = searchIndex.query(query, types);
  const numPages = Math.ceil(results.length / PAGE_SIZE);
  const start = PAGE_SIZE * ((parseInt(page) || 1) - 1);
  results = results.slice(start, start + PAGE_SIZE);

  const promises = [];
  const data = { results, numPages, topics: {}, claims: {}, sources: {} };
  const maybeId = ANY_ID_REGEX.test(query);

  const topicItems = results.filter(item => item.type === ItemType.TOPIC);
  if (topicItems.length > 0 || maybeId) {
    const topicIds = topicItems.map(item => item.id);
    if (maybeId) {
      topicIds.push(query);
    }
    const topics = await Topic.findAll({
      where: { id: topicIds },
      ...Topic.INCLUDE(1),
    });
    for (const topic of topics) {
      if (!topic.head.deleted) {
        promises.push(topic.fillData(data, 1, user));
      }
    }
  }

  const claimItems = results.filter(item => item.type === ItemType.CLAIM);
  if (claimItems.length > 0 || maybeId) {
    const claimIds = claimItems.map(item => item.id);
    if (maybeId) {
      claimIds.push(query);
    }
    const claims = await Claim.findAll({
      where: { id: claimIds },
      ...Claim.INCLUDE(1),
    });
    for (const claim of claims) {
      if (!claim.head.deleted) {
        promises.push(claim.fillData(data, 1, user));
      }
    }
  }

  const sourceItems = results.filter(item => item.type === ItemType.SOURCE);
  if (sourceItems.length > 0 || maybeId) {
    const sourceIds = sourceItems.map(item => item.id);
    if (maybeId) {
      sourceIds.push(query);
    }
    const sources = await Source.findAll({
      where: { id: sourceIds },
      ...Source.INCLUDE(1),
    });
    for (const source of sources) {
      if (!source.head.deleted) {
        promises.push(async () => {
          data.sources[source.id] = await source.toData(user);
        });
      }
    }
  }

  await Promise.all(promises);
  return data;
}
