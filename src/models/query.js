import { Filter, Sort } from '@/common/constants';
import { knex } from '@/models';

function baseQuery(type) {
  return knex(knex.raw(type + 's AS i'))
    .column({
      id: 'i.id',
      revId: 'h.id',
    })
    .leftOuterJoin(knex.raw(type + '_revs AS h'), 'i.head_id', 'h.id');
}

function joinWatched(query, type, user) {
  let table = type + 's';
  let idField = table + '.id';

  // Join table query to extract watched.
  let watchQuery = knex(table)
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
  let table = type + 's';
  let idField = table + '.id';
  // Join table query to extract starCount.
  let starQuery = knex(table)
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
  let commentQuery = knex(table)
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
    let [sortType, dir] = sort;
    if (sortType === Sort.STARS) {
      query.orderBy('starCount', dir ? 'desc' : 'asc');
      return;
    } else if (sortType === Sort.RECENT) {
      query.orderBy('h.created_at', dir ? 'desc' : 'asc');
      return;
    }
  }
  query.orderBy('starCount', 'desc');
}

function filterQuery(query, filters) {
  if (filters && Filter.STARRED in filters) {
    query.where('s.starred', filters[Filter.STARRED]);
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
  sortAndFilter: sortAndFilterQuery,
  count: countQuery,
  joinWatched,
};
