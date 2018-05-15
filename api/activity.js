import Router from 'express-promise-router';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import sortBy from 'lodash/sortBy';

import { ClaimRev, Comment, SourceRev, TopicRev, User } from '../models';
import { ItemType } from '../common/constants';

const router = Router();

function merge (obj, other) {
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

function itemToEntry(itemRev) {
  return {
    timestamp: itemRev.created_at,
    username: itemRev.user.username,
    action: itemToAction(itemRev),
    revId: itemRev.id,
  };
}

function topicRevToEntry(topicRev) {
  let entry = itemToEntry(topicRev);
  entry.type = ItemType.TOPIC;
  entry.id = topicRev.topicId;
  return entry;
}

function claimRevToEntry(claimRev) {
  let entry = itemToEntry(claimRev);
  entry.type = ItemType.CLAIM;
  entry.id = claimRev.claimId;
  return entry;
}

function sourceRevToEntry(sourceRev) {
  let entry = itemToEntry(sourceRev);
  entry.type = ItemType.SOURCE;
  entry.id = sourceRev.sourceId;
  return entry;
}

function commentToEntry(comment) {
  return {
    timestamp: comment.created_at,
    username: comment.user.username,
    action: 'commented on',
    type: comment.commentable,
    id: comment.commentableId,
  };
}

export async function getActivity({ user, limit }) {
  let QUERY = {
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

router.get('/', async function (req, res) {
  let activity = await getActivity({ limit: 100 });
  res.json({ activity });
});

export default router;
