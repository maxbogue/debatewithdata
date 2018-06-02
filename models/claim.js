import keys from 'lodash/keys';
import partition from 'lodash/partition';
import zipWith from 'lodash/zipWith';

import graph, { Graph } from '../common/graph';
import search from '../common/search';
import { ConflictError, NotFoundError } from '../api/error';
import { Filter, ItemType, Sort } from '../common/constants';
import { ValidationError, validateClaim } from '../common/validate';
import { genId } from './utils';
import { claimsAreEqual } from '../common/equality';

export default function (sequelize, DataTypes, knex) {
  const Claim = sequelize.define('claim', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Claim.associate = function (models) {
    Claim.Head = Claim.belongsTo(models.ClaimRev, {
      as: 'head',
      foreignKey: {
        name: 'headId',
        field: 'head_id',
      },
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Claim.hasMany(models.ClaimRev, {
      as: 'claimRevs',
    });
    Claim.belongsToMany(models.User, {
      as: 'starredByUsers',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: ItemType.CLAIM,
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Claim.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: ItemType.CLAIM,
      },
    });
  };

  Claim.postAssociate = function (models) {
    Claim.INCLUDE = function (n) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      return {
        include: [{
          association: Claim.Head,
          ...models.ClaimRev.INCLUDE(n),
        }],
      };
    };

    Claim.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiCreate(user, data, t);
        });
      }

      validateClaim(data);

      const claim = await Claim.create({}, { transaction });
      return models.ClaimRev.createForApi(claim, user, data, transaction);
    };

    Claim.apiUpdate = async function (claimId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiUpdate(claimId, user, data, t);
        });
      }

      const claim = await Claim.findById(claimId, Claim.INCLUDE(2));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      validateClaim(data);
      if (!data.baseRev) {
        throw new ValidationError('baseRev', 'required for update operations.');
      }

      if (data.baseRev !== claim.headId) {
        let newData = await Claim.apiGet(claimId, user);
        throw new ConflictError('Base item changed.', newData);
      }

      if (claimsAreEqual(data, claim.head.toCoreData())) {
        return claim.head;
      }

      return models.ClaimRev.createForApi(claim, user, data, transaction);
    };

    Claim.apiDelete = async function (claimId, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiDelete(claimId, user, msg, t);
        });
      }

      let claim = await Claim.findById(claimId, Claim.INCLUDE(1));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      if (!msg) {
        throw new ValidationError('deleteMessage', 'must exist.');
      }

      if (claim.head.deleted) {
        return claim.head;
      }

      let claimRev = await models.ClaimRev.create({
        userId: user.id,
        claimId: claim.id,
        parentId: claim.headId,
        deleted: true,
        deleteMessage: msg,
      });
      await claim.setHead(claimRev);

      graph.updateClaimPoints(claim.id, [[], []]);

      return claimRev;
    };

    Claim.prototype.fillData = async function (data, depth, user) {
      if (data.claims[this.id] && data.claims[this.id].depth >= depth) {
        // This claim has already been loaded with at least as much depth.
        return;
      }

      let thisData = this.head.toCoreData(depth > 1);
      thisData.depth = thisData.deleted ? 3 : depth;
      let star = await this.toStarData(user);
      thisData.starCount = star.starCount;
      thisData.starred = star.starred;
      thisData.commentCount = await this.countComments();
      thisData.childCount = graph.getCount(this.id);
      thisData.dataCounts = graph.getDataCounts(this.id);

      if (!thisData.deleted && depth > 1) {
        for (let claim of this.head.subClaims) {
          await claim.fillData(data, depth - 1, user);
        }
        for (let source of this.head.sources) {
          data.sources[source.id] = await source.toData();
        }
      }

      if (depth === 3) {
        let superClaims = await models.Claim.findAll({
          include: [{
            association: models.Claim.Head,
            required: true,
            include: [models.Blob, {
              association: models.ClaimRev.SubClaims,
              where: { id: this.id },
            }],
          }],
        });

        let superClaimIds = [];
        for (let superClaim of superClaims) {
          superClaimIds.push(superClaim.id);
          await superClaim.fillData(data, 1, user);
        }
        thisData.superClaimIds = superClaimIds;

        let superTopics = await models.Topic.findAll({
          include: [{
            association: models.Topic.Head,
            required: true,
            include: [models.Blob, {
              association: models.TopicRev.Claims,
              where: { id: this.id },
            }],
          }],
        });

        let superTopicIds = [];
        for (let superTopic of superTopics) {
          superTopicIds.push(superTopic.id);
          await superTopic.fillData(data, 1, user);
        }
        thisData.superTopicIds = superTopicIds;
      }

      data.claims[this.id] = thisData;
    };

    Claim.apiGet = async function (claimId, user) {
      let claim = await Claim.findById(claimId, Claim.INCLUDE(3));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      let data = { topics: {}, claims: {}, sources: {} };
      await claim.fillData(data, 3, user);

      return data;
    };

    function addSortToQuery(query, sort) {
      if (sort) {
        let [sortType, dir] = sort;
        if (sortType === Sort.STARS) {
          return query.orderBy('starCount', dir ? 'desc' : 'asc');
        } else if (sortType === Sort.UPDATED) {
          return query.orderBy('h.created_at', dir ? 'desc' : 'asc');
        }
      }
      return query.orderBy('starCount', 'desc');
    }

    Claim.apiGetAll = async function ({ user, claimIds, filters, sort }) {
      // Join table query to extract starCount.
      let starQuery = knex('claims')
        .column({
          id: 'claims.id',
          starred: knex.raw(
              knex('stars')
                .select(knex.raw('null'))
                .where({
                  'stars.user_id': user ? user.id : null,
                  'stars.starrable_id': knex.raw('??', ['claims.id']),
                  'stars.starrable': knex.raw('?', ['claim']),
                })
                .limit(1)
          ).wrap('exists (', ')'),
        })
        .count({ count: 'stars.id' })
        .leftOuterJoin('stars', function () {
          this.on('claims.id', 'stars.starrable_id')
            .andOn('stars.starrable', knex.raw('?', ['claim']));
        })
        .groupBy('claims.id');

      // Join table query to extract commentCount.
      let commentQuery = knex('claims')
        .column({ id: 'claims.id' })
        .count({ count: 'comments.id' })
        .leftOuterJoin('comments', function () {
          /* eslint no-invalid-this: "off" */
          this.on('claims.id', 'comments.commentable_id')
            .andOn('comments.commentable', knex.raw('?', ['claim']));
        })
        .groupBy('claims.id');

      let query = knex(knex.raw('claims AS c'))
        .column({
          id: 'c.id',
          revId: 'h.id',
          text: 'b.text',
          flag: 'h.flag',
          needsData: 'h.needs_data',
          commentCount: 'm.count',
          starCount: 's.count',
          starred: 's.starred',
        })
        .select()
        .where('deleted', false)
        .leftOuterJoin(knex.raw('claim_revs AS h'), 'c.head_id', 'h.id')
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash')
        .leftOuterJoin(starQuery.as('s'), 'c.id', 's.id')
        .leftOuterJoin(commentQuery.as('m'), 'c.id', 'm.id');

      if (claimIds) {
        query = query.whereIn('c.id', claimIds);
      }

      query = addSortToQuery(query, sort);

      if (filters && Filter.STARRED in filters) {
        query = query.where('s.starred', filters[Filter.STARRED]);
      }

      let claims = await query;
      let data = { claims: {} };
      for (let claim of claims) {
        claim.depth = 1;
        claim.commentCount = Number(claim.commentCount);
        claim.starCount = Number(claim.starCount);
        claim.childCount = graph.getCount(claim.id);
        claim.dataCounts = graph.getDataCounts(claim.id);
        data.claims[claim.id] = claim;
      }
      data.results = claims.map((claim) => claim.id);
      return data;
    };

    Claim.apiGetRevs = async function (claimId, user) {
      let claim = await Claim.findById(claimId, Claim.INCLUDE(1));
      let claimRevs = await models.ClaimRev.findAll({
        where: { claimId },
        order: [['created_at', 'DESC']],
        ...models.ClaimRev.INCLUDE(2, true),
      });

      if (!claim || claimRevs.length === 0) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      let data = { claimRevs: [], topics: {}, claims: {}, sources: {} };

      // Include the claim itself for star/comment info.
      await claim.fillData(data, 1, user);
      for (let claimRev of claimRevs) {
        await claimRev.fillData(data);
      }
      return data;
    };

    Claim.prototype.toStarData = async function (user) {
      let starCount = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { starCount, starred };
    };

    Claim.apiToggleStar = async function (claimId, user) {
      let claim = await Claim.findById(claimId);
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      let isStarred = await claim.hasStarredByUser(user);
      if (isStarred) {
        await claim.removeStarredByUser(user);
      } else {
        await claim.addStarredByUser(user);
      }
      return await claim.toStarData(user);
    };

    Claim.prototype.updateGraph = function (subClaims, sources) {
      let partedSubClaims = subClaims
        ? partition(keys(subClaims), (id) => subClaims[id])
        : partition(this.head.subClaims, (c) => c.claimClaim.isFor);

      let partedSources = sources
        ? partition(keys(sources), (id) => sources[id])
        : partition(this.head.sources, (s) => s.claimSource.isFor);

      let claimInfos = partedSubClaims.map((ls) => ls.map(Graph.toClaimInfo));
      let sourceInfos = partedSources.map((ls) => ls.map(Graph.toSourceInfo));

      // Merge together the claim and source nested arrays.
      let pointInfos = zipWith(claimInfos, sourceInfos,
          (head, ...tail) => head.concat(...tail));

      graph.updateClaimPoints(this.id, pointInfos);
    };

    Claim.prototype.updateIndex = function (data) {
      data = data || this.head.toCoreData();
      search.updateClaim(data);
    };
  };

  return Claim;
}
