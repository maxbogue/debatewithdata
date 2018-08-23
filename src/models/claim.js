import _ from 'lodash';

import graph, { Graph } from '../common/graph';
import q from './query';
import search from '../common/search';
import { PAGE_SIZE, ItemType } from '../common/constants';
import { ConflictError, NotFoundError } from '../api/error';
import { ValidationError, validateClaim } from '../common/validate';
import { claimsAreEqual } from '../common/equality';
import { genId } from './utils';

const CLAIM = ItemType.CLAIM;

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
          starrable: CLAIM,
        }
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
        }
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
      thisData.watched = star.watched;
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

    function addClaimFields(query) {
      query
        .column({
          text: 'b.text',
          flag: 'h.flag',
          needsData: 'h.needs_data',
        })
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash');
    }

    Claim.itemQuery = function (user) {
      return q.item(CLAIM, user).modify(addClaimFields);
    };

    Claim.processQueryResults = function (claims) {
      let data = {};
      for (let claim of claims) {
        claim.depth = 1;
        claim.childCount = graph.getCount(claim.id);
        claim.dataCounts = graph.getDataCounts(claim.id);
        data[claim.id] = claim;
      }
      return data;
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

    Claim.apiGetAll = async function ({ user, filters, sort, page } = {}) {
      page = page || 1;

      let query = Claim.itemQuery(user)
        .where('deleted', false)
        .modify(q.sortAndFilter, sort, filters);

      let countQuery = query.clone().clearSelect().clearOrder().count('*');
      query.offset(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);

      let [claims, [{ count }]] = await Promise.all([query, countQuery]);
      return {
        claims: Claim.processQueryResults(claims),
        results: claims.map((claim) => claim.id),
        numPages: Math.ceil(count / PAGE_SIZE),
      };
    };

    Claim.apiGetForTrail = async function (ids, user) {
      let flatClaims = await Claim.itemQuery(user)
        .column({
          subClaimId: 'claim_claims.claim_id',
          subClaimIsFor: 'claim_claims.is_for',
          sourceId: 'claim_sources.source_id',
          sourceIsFor: 'claim_sources.is_for',
        })
        .whereIn('i.id', ids)
        .leftOuterJoin(
          'claim_claims', 'i.head_id', 'claim_claims.claim_rev_id')
        .leftOuterJoin(
          'claim_sources', 'i.head_id', 'claim_sources.claim_rev_id');

      let claims = _.chain(flatClaims).groupBy('id').map((groupedClaims) => {
        let claim = _.omit(groupedClaims[0], [
          'subClaimId',
          'subClaimIsFor',
          'sourceId',
          'sourceIsFor',
        ]);
        claim.subClaimIds = {};
        claim.sourceIds = {};
        for (let c of groupedClaims) {
          if (c.subClaimId) {
            claim.subClaimIds[c.subClaimId] = c.subClaimIsFor;
          }
          if (c.sourceId) {
            claim.sourceIds[c.sourceId] = c.sourceIsFor;
          }
        }
        return claim;
      }).value();

      return {
        claims: Claim.processQueryResults(claims),
      };
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
      let watched = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
        watched = await this.hasWatchedByUser(user);
      }
      return { starCount, starred, watched };
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
        await claim.addWatchedByUser(user);
      }
      return await claim.toStarData(user);
    };

    Claim.apiToggleWatch = async function (claimId, user) {
      let claim = await Claim.findById(claimId);
      if (!claim) {
        throw new NotFoundError('Claim not found: ' + claimId);
      }
      let isWatched = await claim.hasWatchedByUser(user);
      if (isWatched) {
        await claim.removeWatchedByUser(user);
      } else {
        await claim.addWatchedByUser(user);
      }
      return { watched: !isWatched };
    };

    Claim.prototype.updateGraph = function (subClaims, sources) {
      let partedSubClaims = subClaims
        ? _.partition(_.keys(subClaims), (id) => subClaims[id])
        : _.partition(this.head.subClaims, (c) => c.claimClaim.isFor);

      let partedSources = sources
        ? _.partition(_.keys(sources), (id) => sources[id])
        : _.partition(this.head.sources, (s) => s.claimSource.isFor);

      let claimInfos = partedSubClaims.map((ls) => ls.map(Graph.toClaimInfo));
      let sourceInfos = partedSources.map((ls) => ls.map(Graph.toSourceInfo));

      // Merge together the claim and source nested arrays.
      let pointInfos = _.zipWith(claimInfos, sourceInfos,
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