import isArray from 'lodash/fp/isArray';
import mergeWith from 'lodash/fp/mergeWith';
import sortBy from 'lodash/fp/sortBy';

import { ActivityAction, ActivityEntry } from '@/api/interface';
import { ItemType } from '@/common/constants';
import { ClaimRev, Comment, SourceRev, TopicRev, User } from '@/models';

interface User {
  id: string;
  username: string;
}

interface ItemRev {
  id: string;
  deleted: boolean;
  parentId: string;
  user: User;
  created_at: string;
}

interface TopicRev extends ItemRev {
  topicId: string;
}

interface ClaimRev extends ItemRev {
  claimId: string;
}

interface SourceRev extends ItemRev {
  sourceId: string;
}

interface Comment {
  created_at: string;
  user: User;
  commentable: string;
  commentableId: string;
}

const merge = mergeWith((a, b) => {
  if (isArray(a)) {
    return a.concat(b);
  }
  return undefined;
});

function itemToAction(itemRev: ItemRev): ActivityAction {
  if (itemRev.deleted) {
    return ActivityAction.Deleted;
  }
  if (!itemRev.parentId) {
    return ActivityAction.Added;
  }
  return ActivityAction.Edited;
}

const itemToEntry = (itemRev: ItemRev) => ({
  timestamp: itemRev.created_at,
  username: itemRev.user.username,
  action: itemToAction(itemRev),
  revId: itemRev.id,
});

const topicRevToEntry = (topicRev: TopicRev): ActivityEntry => ({
  ...itemToEntry(topicRev),
  type: ItemType.TOPIC,
  id: topicRev.topicId,
});

const claimRevToEntry = (claimRev: ClaimRev): ActivityEntry => ({
  ...itemToEntry(claimRev),
  type: ItemType.CLAIM,
  id: claimRev.claimId,
});

const sourceRevToEntry = (sourceRev: SourceRev): ActivityEntry => ({
  ...itemToEntry(sourceRev),
  type: ItemType.SOURCE,
  id: sourceRev.sourceId,
});

const commentToEntry = (comment: Comment): ActivityEntry => ({
  timestamp: comment.created_at,
  username: comment.user.username,
  action: ActivityAction.Commented,
  type: comment.commentable,
  id: comment.commentableId,
});

export async function getActivity({
  user = null,
  limit,
}: {
  user?: User | null;
  limit: number;
}) {
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
