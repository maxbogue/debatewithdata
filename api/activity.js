import Router from 'express-promise-router';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import { ClaimRev, Comment, SourceRev, User } from '../models';

const router = Router();

function itemToAction(item) {
  if (item.deleted) {
    return 'deleted';
  }
  if (!item.parentId) {
    return 'added';
  }
  return 'edited';
}

function itemToEntry(item) {
  return {
    timestamp: Math.floor(item.created_at.getTime() / 1000),
    username: item.user.username,
    action: itemToAction(item),
  };
}

function claimRevToEntry(claimRev) {
  let entry = itemToEntry(claimRev);
  entry.type = 'claim';
  entry.id = claimRev.claimId;
  return entry;
}

function sourceRevToEntry(sourceRev) {
  let entry = itemToEntry(sourceRev);
  entry.type = 'source';
  entry.id = sourceRev.sourceId;
  return entry;
}

function commentToEntry(comment) {
  return {
    timestamp: Math.floor(comment.created_at.getTime() / 1000),
    username: comment.user.username,
    action: 'commented on',
    type: comment.commentable,
    id: comment.commentableId,
  };
}

router.get('/', async function (req, res) {
  let claimRevs = await ClaimRev.findAll({
    attributes: ['deleted', 'claimId', 'parentId', 'created_at'],
    include: {
      model: User,
      attributes: ['username'],
    },
    order: [['created_at', 'DESC']],
    limit: 100,
  });
  let sourceRevs = await SourceRev.findAll({
    attributes: ['deleted', 'sourceId', 'parentId', 'created_at'],
    include: {
      model: User,
      attributes: ['username'],
    },
    order: [['created_at', 'DESC']],
    limit: 100,
  });
  let comments = await Comment.findAll({
    attributes: ['commentable', 'commentableId', 'created_at'],
    where: { deleted: false },
    include: {
      model: User,
      attributes: ['username'],
    },
    order: [['created_at', 'DESC']],
    limit: 100,
  });
  let claimEntries = map(claimRevs, claimRevToEntry);
  let sourceEntries = map(sourceRevs, sourceRevToEntry);
  let commentEntries = map(comments, commentToEntry);
  let activity = claimEntries.concat(sourceEntries, commentEntries);
  res.json(sortBy(activity, (e) => -e.timestamp).slice(0, 100));
});

export default router;
