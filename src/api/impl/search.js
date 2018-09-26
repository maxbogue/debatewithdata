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
  let numPages = Math.ceil(results.length / PAGE_SIZE);
  let start = PAGE_SIZE * ((parseInt(page) || 1) - 1);
  results = results.slice(start, start + PAGE_SIZE);

  let promises = [];
  let data = { results, numPages, topics: {}, claims: {}, sources: {} };
  let maybeId = ANY_ID_REGEX.test(query);

  let topicItems = results.filter(item => item.type === ItemType.TOPIC);
  if (topicItems.length > 0 || maybeId) {
    let topicIds = topicItems.map(item => item.id);
    if (maybeId) {
      topicIds.push(query);
    }
    let topics = await Topic.findAll({
      where: { id: topicIds },
      ...Topic.INCLUDE(1),
    });
    for (let topic of topics) {
      if (!topic.head.deleted) {
        promises.push(topic.fillData(data, 1, user));
      }
    }
  }

  let claimItems = results.filter(item => item.type === ItemType.CLAIM);
  if (claimItems.length > 0 || maybeId) {
    let claimIds = claimItems.map(item => item.id);
    if (maybeId) {
      claimIds.push(query);
    }
    let claims = await Claim.findAll({
      where: { id: claimIds },
      ...Claim.INCLUDE(1),
    });
    for (let claim of claims) {
      if (!claim.head.deleted) {
        promises.push(claim.fillData(data, 1, user));
      }
    }
  }

  let sourceItems = results.filter(item => item.type === ItemType.SOURCE);
  if (sourceItems.length > 0 || maybeId) {
    let sourceIds = sourceItems.map(item => item.id);
    if (maybeId) {
      sourceIds.push(query);
    }
    let sources = await Source.findAll({
      where: { id: sourceIds },
      ...Source.INCLUDE(1),
    });
    for (let source of sources) {
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
