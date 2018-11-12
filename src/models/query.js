import { Filter, Sort } from '@/common/constants';
import { knex } from '@/models';

export const COMMON_FIELDS = [
  'id',
  'revId',
  'updatedAt',
  'deleted',
  'deleteMessage',
];

export const ITEM_FIELDS = [
  ...COMMON_FIELDS,
  'watched',
  'starred',
  'starCount',
  'commentCount',
];

function baseQuery(type) {
  return knex(knex.raw(type + 's AS i'))
    .column({
      id: 'i.id',
      revId: 'h.id',
      updatedAt: 'h.created_at',
      deleted: 'h.deleted',
      deleteMessage: 'h.delete_message',
    })
    .leftOuterJoin(knex.raw(type + '_revs AS h'), 'i.head_id', 'h.id');
}

function joinWatched(query, type, user) {
  const table = type + 's';
  const idField = table + '.id';

  // Join table query to extract watched.
  const watchQuery = knex(table)
    .column({ id: idField })
    .exists({
      watched: knex('watches').where({
        'watches.user_id': user ? user.id : null,
        'watches.watchable_id': knex.raw('??', [idField]),
        'watches.watchable': knex.raw('?', [type]),
      }),
    });

  query
    .column({ watched: 'w.watched' })
    .leftOuterJoin(watchQuery.as('w'), 'i.id', 'w.id');
}

function itemQuery(type, user) {
  const table = type + 's';
  const idField = table + '.id';
  // Join table query to extract starCount.
  const starQuery = knex(table)
    .column({ id: idField })
    .exists({
      starred: knex('stars').where({
        'stars.user_id': user ? user.id : null,
        'stars.starrable_id': knex.raw('??', [idField]),
        'stars.starrable': knex.raw('?', [type]),
      }),
    })
    .count({ count: 'stars.id' })
    .leftOuterJoin('stars', function() {
      this.on(idField, 'stars.starrable_id').andOn(
        'stars.starrable',
        knex.raw('?', [type])
      );
    })
    .groupBy(idField);

  // Join table query to extract commentCount.
  const commentQuery = knex(table)
    .column({ id: idField })
    .count({ count: 'comments.id' })
    .leftOuterJoin('comments', function() {
      /* eslint no-invalid-this: "off" */
      this.on(idField, 'comments.commentable_id').andOn(
        'comments.commentable',
        knex.raw('?', [type])
      );
    })
    .groupBy(idField);

  return baseQuery(type)
    .column({
      commentCount: 'm.count',
      starCount: 's.count',
      starred: 's.starred',
    })
    .leftOuterJoin(starQuery.as('s'), 'i.id', 's.id')
    .leftOuterJoin(commentQuery.as('m'), 'i.id', 'm.id')
    .modify(joinWatched, type, user);
}

function sortQuery(query, sort) {
  if (sort) {
    const [sortType, dir] = sort;
    if (sortType === Sort.STARS) {
      query.orderBy('starCount', dir ? 'desc' : 'asc');
      return;
    } else if (sortType === Sort.RECENT) {
      query.orderBy('updatedAt', dir ? 'desc' : 'asc');
      return;
    }
  }
  query.orderBy('starCount', 'desc');
}

function filterQuery(query, filters) {
  if (filters && Filter.STARRED in filters) {
    query.where('starred', filters[Filter.STARRED]);
  }
}

function sortAndFilterQuery(query, sort, filters) {
  sortQuery(query, sort);
  filterQuery(query, filters);
}

function countQuery(query) {
  query
    .clearSelect()
    .clearOrder()
    .count('*');
}

export default {
  base: baseQuery,
  item: itemQuery,
  sort: sortQuery,
  filter: filterQuery,
  sortAndFilter: sortAndFilterQuery,
  count: countQuery,
  joinWatched,
};
