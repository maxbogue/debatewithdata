import _ from 'lodash/fp';

import { ConflictError, NotFoundError } from '@/api/error';
import { ItemType, PAGE_SIZE } from '@/common/constants';
import { claimsAreEqual } from '@/common/equality';
import graph, { Graph } from '@/common/graph';
import search from '@/common/search';
import { validateClaim, ValidationError } from '@/common/validate';

import q, { ITEM_FIELDS } from './query';
import { genId } from './utils';

const CLAIM = ItemType.CLAIM;

const hydrateClaims = _.flow(
  _.groupBy('id'),
  _.map(grouped => {
    const claim = _.omit(
      ['subClaimId', 'subClaimIsFor', 'sourceId', 'sourceIsFor'],
      grouped[0]
    );
    claim.subClaimIds = {};
    claim.sourceIds = {};
    for (const c of grouped) {
      if (c.subClaimId) {
        claim.subClaimIds[c.subClaimId] = c.subClaimIsFor;
      }
      if (c.sourceId) {
        claim.sourceIds[c.sourceId] = c.sourceIsFor;
      }
    }
    return claim;
  })
);

export default function(sequelize, DataTypes, knex) {
  const Claim = sequelize.define('claim', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Claim.associate = function(models) {
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
          starrable: CLAIM,
        },
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Claim.belongsToMany(models.User, {
      as: 'watchedByUsers',
      through: {
        model: models.Watch,
        unique: false,
        scope: {
          watchable: CLAIM,
        },
      },
      foreignKey: 'watchableId',
      constraints: false,
    });
    Claim.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: CLAIM,
      },
    });
  };

  Claim.postAssociate = function(models) {
    Claim.INCLUDE = function(n) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      return {
        include: [
          {
            association: Claim.Head,
            ...models.ClaimRev.INCLUDE(n),
          },
        ],
      };
    };

    Claim.apiCreate = async function(user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiCreate(user, data, t);
        });
      }

      validateClaim(data);

      const claim = await Claim.create({}, { transaction });
      return models.ClaimRev.createForApi(claim, user, data, transaction);
    };

    Claim.apiUpdate = async function(claimId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiUpdate(claimId, user, data, t);
        });
      }

      const claim = await Claim.findByPk(claimId, Claim.INCLUDE(2));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      validateClaim(data);
      if (!data.baseRev) {
        throw new ValidationError('baseRev', 'required for update operations.');
      }

      if (data.baseRev !== claim.headId) {
        const newData = await Claim.apiGet(claimId, user);
        throw new ConflictError('Base item changed.', newData);
      }

      if (claimsAreEqual(data, claim.head.toCoreData())) {
        return claim.head;
      }

      return models.ClaimRev.createForApi(claim, user, data, transaction);
    };

    Claim.apiDelete = async function(claimId, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Claim.apiDelete(claimId, user, msg, t);
        });
      }

      const claim = await Claim.findByPk(claimId, Claim.INCLUDE(1));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      if (!msg) {
        throw new ValidationError('deleteMessage', 'must exist.');
      }

      if (claim.head.deleted) {
        return claim.head;
      }

      const claimRev = await models.ClaimRev.create({
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

    Claim.prototype.fillData = async function(
      data,
      depth,
      user,
      includeSupers = false
    ) {
      if (data.claims[this.id] && data.claims[this.id].depth >= depth) {
        // This claim has already been loaded with at least as much depth.
        return;
      }

      const thisData = this.head.toCoreData(depth > 1);
      thisData.depth = thisData.deleted ? 3 : depth;
      const star = await this.toStarData(user);
      thisData.starCount = star.starCount;
      thisData.starred = star.starred;
      thisData.watched = star.watched;
      thisData.commentCount = await this.countComments();
      thisData.childCount = graph.getCount(this.id);
      thisData.dataCounts = graph.getDataCounts(this.id);

      const promises = [];

      if (!thisData.deleted && depth > 1) {
        for (const claim of this.head.subClaims) {
          promises.push(claim.fillData(data, depth - 1, user));
        }
        for (const source of this.head.sources) {
          promises.push(
            source.toData(user).then(sourceData => {
              data.sources[source.id] = sourceData;
            })
          );
        }
      }

      if (includeSupers) {
        const superClaims = await models.Claim.findAll({
          include: [
            {
              association: models.Claim.Head,
              required: true,
              include: [
                models.Blob,
                {
                  association: models.ClaimRev.SubClaims,
                  where: { id: this.id },
                },
              ],
            },
          ],
        });

        const superClaimIds = [];
        for (const superClaim of superClaims) {
          superClaimIds.push(superClaim.id);
          promises.push(superClaim.fillData(data, 1, user));
        }
        thisData.superClaimIds = superClaimIds;

        const superTopics = await models.Topic.findAll({
          include: [
            {
              association: models.Topic.Head,
              required: true,
              include: [
                models.Blob,
                {
                  association: models.TopicRev.Claims,
                  where: { id: this.id },
                },
              ],
            },
          ],
        });

        const superTopicIds = [];
        for (const superTopic of superTopics) {
          superTopicIds.push(superTopic.id);
          promises.push(superTopic.fillData(data, 1, user));
        }
        thisData.superTopicIds = superTopicIds;
      }

      await Promise.all(promises);
      data.claims[this.id] = thisData;
    };

    const CLAIM_FIELDS = [...ITEM_FIELDS, 'text', 'flag', 'needsData'];

    Claim.innerQuery = (user, modFn = _.identity) =>
      q
        .item(CLAIM, user)
        .column({
          text: 'b.text',
          flag: 'h.flag',
          needsData: 'h.needs_data',
        })
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash')
        .modify(modFn);

    Claim.wrapQueryWithJoins = query =>
      knex
        .select(CLAIM_FIELDS)
        .from(knex.raw(query).wrap('(', ') AS ignored'))
        .column({
          subClaimId: 'claim_claims.claim_id',
          subClaimIsFor: 'claim_claims.is_for',
          sourceId: 'claim_sources.source_id',
          sourceIsFor: 'claim_sources.is_for',
        })
        .leftOuterJoin('claim_claims', 'revId', 'claim_claims.claim_rev_id')
        .leftOuterJoin('claim_sources', 'revId', 'claim_sources.claim_rev_id');

    Claim.itemQuery = (user, filterFn = _.identity, sortFn = _.identity) =>
      Claim.wrapQueryWithJoins(
        Claim.innerQuery(
          user,
          _.flow(
            filterFn,
            sortFn
          )
        )
      ).modify(sortFn);

    Claim.processQueryResults = _.flow(
      hydrateClaims,
      _.forEach(claim => {
        claim.depth = 1;
        claim.childCount = graph.getCount(claim.id);
        claim.dataCounts = graph.getDataCounts(claim.id);
      })
    );

    Claim.apiGet = async function(id, user, hasTrail) {
      const claim = await Claim.findByPk(id, Claim.INCLUDE(3));
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + id);
      }
      const data = { topics: {}, claims: {}, sources: {} };
      await claim.fillData(data, 3, user, !hasTrail);
      return data;
    };

    Claim.apiGetAll = async function({ user, filters, sort, page } = {}) {
      page = page || 1;

      const filterFn = query =>
        query
          .where('deleted', false)
          .modify(q.filter, filters)
          .offset(PAGE_SIZE * (page - 1))
          .limit(PAGE_SIZE);
      const sortFn = query => query.modify(q.sort, sort);

      const query = Claim.itemQuery(user, filterFn, sortFn);
      const countQuery = Claim.innerQuery(user)
        .where('deleted', false)
        .modify(q.filter, filters)
        .modify(q.count);

      const [flatClaims, [{ count }]] = await Promise.all([query, countQuery]);
      const claims = Claim.processQueryResults(flatClaims);

      return {
        claims: _.keyBy('id', claims),
        results: claims.map(claim => claim.id),
        numPages: Math.ceil(count / PAGE_SIZE),
      };
    };

    Claim.apiGetForTrail = async function(ids, user) {
      const filterFn = query => query.whereIn('i.id', ids);
      const flatClaims = await Claim.itemQuery(user, filterFn);
      const claims = Claim.processQueryResults(flatClaims);
      return {
        claims: _.keyBy('id', claims),
      };
    };

    Claim.apiGetRevs = async function(claimId, user) {
      const claim = await Claim.findByPk(claimId, Claim.INCLUDE(1));
      const claimRevs = await models.ClaimRev.findAll({
        where: { claimId },
        order: [['createdAt', 'DESC']],
        ...models.ClaimRev.INCLUDE(2, true),
      });

      if (!claim || claimRevs.length === 0) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }

      const data = { claimRevs: [], topics: {}, claims: {}, sources: {} };

      // Include the claim itself for star/comment info.
      await claim.fillData(data, 1, user);
      data.claimRevs = await Promise.all(
        claimRevs.map(rev => rev.fillData(data, user))
      );
      return data;
    };

    Claim.prototype.toStarData = async function(user) {
      const starCount = await this.countStarredByUsers();
      let starred = false;
      let watched = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
        watched = await this.hasWatchedByUser(user);
      }
      return { starCount, starred, watched };
    };

    Claim.apiToggleStar = async function(claimId, user) {
      const claim = await Claim.findByPk(claimId);
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      const isStarred = await claim.hasStarredByUser(user);
      if (isStarred) {
        await claim.removeStarredByUser(user);
      } else {
        await claim.addStarredByUser(user);
        await claim.addWatchedByUser(user);
      }
      return await claim.toStarData(user);
    };

    Claim.apiToggleWatch = async function(claimId, user) {
      const claim = await Claim.findByPk(claimId);
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      const isWatched = await claim.hasWatchedByUser(user);
      if (isWatched) {
        await claim.removeWatchedByUser(user);
      } else {
        await claim.addWatchedByUser(user);
      }
      return { watched: !isWatched };
    };

    Claim.prototype.updateGraph = function(subClaims, sources) {
      const partedSubClaims = subClaims
        ? _.partition(id => subClaims[id], _.keys(subClaims))
        : _.partition(c => c.claimClaim.isFor, this.head.subClaims);

      const partedSources = sources
        ? _.partition(id => sources[id], _.keys(sources))
        : _.partition(s => s.claimSource.isFor, this.head.sources);

      const claimInfos = partedSubClaims.map(ls => ls.map(Graph.toClaimInfo));
      const sourceInfos = partedSources.map(ls => ls.map(Graph.toSourceInfo));

      // Merge together the claim and source nested arrays.
      const pointInfos = _.zipWith(
        (head, ...tail) => head.concat(...tail),
        claimInfos,
        sourceInfos
      );

      graph.updateClaimPoints(this.id, pointInfos);
    };

    Claim.prototype.updateIndex = function(data) {
      data = data || this.head.toCoreData();
      search.updateClaim(data);
    };
  };

  return Claim;
}
