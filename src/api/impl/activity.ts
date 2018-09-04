import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import sortBy from 'lodash/sortBy';

import { ClaimRev, Comment, SourceRev, TopicRev, User } from '@/models';
import { ItemType } from '@/common/constants';

function merge(obj, other) {
  return mergeWith(obj, other, (a, b) => {
    if (isArray(a)) {
      return a.concat(b);
    }
    return undefined;
  });
}

function itemToAction(itemRev) {
  if (itemRev.deleted) {
    return 'deleted';
  }
  if (!itemRev.parentId) {
    return 'added';
  }
  return 'edited';
}

const itemToEntry = (itemRev) => ({
  timestamp: itemRev.created_at,
  username: itemRev.user.username,
  action: itemToAction(itemRev),
  revId: itemRev.id,
});

const topicRevToEntry = (topicRev) => ({
  ...itemToEntry(topicRev),
  type: ItemType.TOPIC,
  id: topicRev.topicId,
});

const claimRevToEntry = (claimRev) => ({
  ...itemToEntry(claimRev),
  type: ItemType.CLAIM,
  id: claimRev.claimId,
});

const sourceRevToEntry = (sourceRev) => ({
  ...itemToEntry(sourceRev),
  type: ItemType.SOURCE,
  id: sourceRev.sourceId,
});

const commentToEntry = (comment) => ({
  timestamp: comment.created_at,
  username: comment.user.username,
  action: 'commented on',
  type: comment.commentable,
  id: comment.commentableId,
});

export async function getActivity({ user = null, limit }) {
  let QUERY: any = {
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

  let ITEM_ATTRS = ['id', 'deleted', 'parentId', 'created_at'];
  let topicRevs = await TopicRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'topicId'],
  });
  let claimRevs = await ClaimRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'claimId'],
  });
  let sourceRevs = await SourceRev.findAll({
    ...QUERY,
    attributes: [...ITEM_ATTRS, 'sourceId'],
  });

  let comments = await Comment.findAll(merge({
    attributes: ['commentable', 'commentableId', 'created_at'],
    where: { deleted: false },
  }, QUERY));

  let topicEntries = topicRevs.map(topicRevToEntry);
  let claimEntries = claimRevs.map(claimRevToEntry);
  let sourceEntries = sourceRevs.map(sourceRevToEntry);
  let commentEntries = comments.map(commentToEntry);

  let activity = topicEntries.concat(
    claimEntries, sourceEntries, commentEntries);
  activity = sortBy(activity, (e) => -e.timestamp.getTime());
  if (limit) {
    activity = activity.slice(0, limit);
  }
  return activity;
}
