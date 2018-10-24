import isArray from 'lodash/fp/isArray';
import mergeWith from 'lodash/fp/mergeWith';
import sortBy from 'lodash/fp/sortBy';

import { ItemType } from '@/common/constants';
import { ClaimRev, Comment, SourceRev, TopicRev, User } from '@/models';

const merge = mergeWith((a, b) => {
  if (isArray(a)) {
    return a.concat(b);
  }
  return undefined;
});

function itemToAction(itemRev) {
  if (itemRev.deleted) {
    return 'deleted';
  }
  if (!itemRev.parentId) {
    return 'added';
  }
  return 'edited';
}

const itemToEntry = itemRev => ({
  timestamp: itemRev.created_at,
  username: itemRev.user.username,
  action: itemToAction(itemRev),
  revId: itemRev.id,
});

const topicRevToEntry = topicRev => ({
  ...itemToEntry(topicRev),
  type: ItemType.TOPIC,
  id: topicRev.topicId,
});

const claimRevToEntry = claimRev => ({
  ...itemToEntry(claimRev),
  type: ItemType.CLAIM,
  id: claimRev.claimId,
});

const sourceRevToEntry = sourceRev => ({
  ...itemToEntry(sourceRev),
  type: ItemType.SOURCE,
  id: sourceRev.sourceId,
});

const commentToEntry = comment => ({
  timestamp: comment.created_at,
  username: comment.user.username,
  action: 'commented on',
  type: comment.commentable,
  id: comment.commentableId,
});

export async function getActivity({ user = null, limit }) {
  const QUERY: any = {
    include: {
      model: User,
      attributes: ['username'],
    },
    order: [['created_at', 'DESC']],
    limit,
  };
  if (user) {
    QUERY.where = { userId: user.id };
  }

  const ITEM_ATTRS = ['id', 'deleted', 'parentId', 'created_at'];
  const topicRevs = await TopicRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'topicId'],
  });
  const claimRevs = await ClaimRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'claimId'],
  });
  const sourceRevs = await SourceRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'sourceId'],
  });

  const comments = await Comment.findAll(
    merge(
      {
        attributes: ['commentable', 'commentableId', 'created_at'],
        where: { deleted: false },
      },
      QUERY
    )
  );

  const topicEntries = topicRevs.map(topicRevToEntry);
  const claimEntries = claimRevs.map(claimRevToEntry);
  const sourceEntries = sourceRevs.map(sourceRevToEntry);
  const commentEntries = comments.map(commentToEntry);

  let activity = topicEntries.concat(
    claimEntries,
    sourceEntries,
    commentEntries
  );
  activity = sortBy(e => -e.timestamp.getTime(), activity);
  if (limit) {
    activity = activity.slice(0, limit);
  }
  return activity;
}
