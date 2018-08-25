import q from './query';
import search from '@/common/search';
import { ConflictError, NotFoundError } from '@/api/error';
import { ItemType, PAGE_SIZE } from '@/common/constants';
import { ValidationError, validateSource } from '@/common/validate';
import { genId } from './utils';
import { sourcesAreEqual } from '@/common/equality';

const SOURCE = ItemType.SOURCE;

export default function (sequelize, DataTypes, knex) {
  const Source = sequelize.define('source', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Source.associate = function (models) {
    Source.Head = Source.belongsTo(models.SourceRev, {
      as: 'head',
      foreignKey: {
        name: 'headId',
        field: 'head_id',
      },
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Source.hasMany(models.SourceRev);
    Source.belongsToMany(models.User, {
      as: 'starredByUsers',
      through: {
        model: models.Star,
        unique: false,
        scope: {
          starrable: SOURCE,
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Source.belongsToMany(models.User, {
      as: 'watchedByUsers',
      through: {
        model: models.Watch,
        unique: false,
        scope: {
          watchable: SOURCE,
        }
      },
      foreignKey: 'watchableId',
      constraints: false,
    });
    Source.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: SOURCE,
      },
    });
  };

  Source.postAssociate = function (models) {
    Source.INCLUDE = function () {
      return {
        include: [{
          association: Source.Head,
          ...models.SourceRev.INCLUDE(),
        }],
      };
    };

    Source.apiCreate = async function (user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiCreate(user, data, t);
        });
      }

      validateSource(data);

      let source = await Source.create({}, { transaction });
      return models.SourceRev.createForApi(source, user, data, transaction);
    };

    Source.apiUpdate = async function (sourceId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiUpdate(sourceId, user, data, t);
        });
      }

      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }

      validateSource(data);
      if (!data.baseRev) {
        throw new ValidationError('baseRev', 'required for update operations.');
      }

      if (data.baseRev !== source.headId) {
        let newData = await Source.apiGet(sourceId, user);
        throw new ConflictError('Base item changed.', newData);
      }

      if (sourcesAreEqual(data, source.head.toCoreData())) {
        return source.head;
      }

      return models.SourceRev.createForApi(source, user, data, transaction);
    };

    Source.apiDelete = async function (sourceId, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiDelete(sourceId, user, msg, t);
        });
      }

      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }

      if (!msg) {
        throw new ValidationError('deleteMessage', 'must exist.');
      }

      if (source.head.deleted) {
        return source.head;
      }

      let rev = await models.SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        parentId: source.headId,
        deleted: true,
        deleteMessage: msg,
      }, { transaction });
      await source.setHead(rev, { transaction });
      return rev;
    };

    Source.prototype.toData = async function (user) {
      let data = this.head.toCoreData();
      let star = await this.toStarData(user);
      data.starCount = star.starCount;
      data.starred = star.starred;
      data.watched = star.watched;
      data.commentCount = await this.countComments();
      return data;
    };

    function addSourceFields(query) {
      query
        .column({
          text: 'b.text',
          url: 'h.url',
          date: 'h.date',
          table: 't.text',
          chart: 'h.chart',
          type: 'h.type',
          institution: 'h.institution',
          publication: 'h.publication',
        })
        .leftOuterJoin(knex.raw('blobs AS b'), 'h.blob_hash', 'b.hash')
        .leftOuterJoin(knex.raw('blobs AS t'), 'h.table_hash', 't.hash');
    }

    Source.itemQuery = function (user) {
      return q.item(SOURCE, user).modify(addSourceFields);
    };

    Source.processQueryResults = function (sources) {
      let data = {};
      for (let source of sources) {
        source.chart = JSON.parse(source.chart);
        data[source.id] = source;
      }
      return data;
    };

    Source.apiGet = async function (sourceId, user, hasTrail) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }

      let sourceData = await source.toData(user);
      let data = {
        sources: {
          [sourceId]: sourceData,
        },
        claims: {},
      };

      if (!hasTrail) {
        // Referenced by claims.
        let claims = await models.Claim.findAll({
          include: [{
            association: models.Claim.Head,
            required: true,
            include: [models.Blob, {
              association: models.ClaimRev.Sources,
              where: { id: sourceId },
            }],
          }],
        });
        sourceData.claimIds = claims.map((claim) => claim.id);
        for (let claim of claims) {
          await claim.fillData(data, 1, user);
        }
      }

      return data;
    };

    Source.apiGetAll = async function ({ user, filters, sort, page } = {}) {
      page = page || 1;

      let query = Source.itemQuery(user)
        .where('deleted', false)
        .modify(q.sortAndFilter, sort, filters);

      let countQuery = query.clone().clearSelect().clearOrder().count('*');
      query.offset(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE);

      let [sources, [{ count }]] = await Promise.all([query, countQuery]);
      return {
        sources: Source.processQueryResults(sources),
        results: sources.map((source) => source.id),
        numPages: Math.ceil(count / PAGE_SIZE),
      };
    };

    Source.apiGetRevs = async function (sourceId) {
      let sourceRevs = await models.SourceRev.findAll({
        where: { sourceId },
        order: [['created_at', 'DESC']],
        ...models.SourceRev.INCLUDE(true),
      });

      if (sourceRevs.length === 0) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }

      let sourceRevData = sourceRevs.map((rev) => rev.toRevData());
      return { sourceRevs: sourceRevData };
    };

    Source.prototype.toStarData = async function (user) {
      let starCount = await this.countStarredByUsers();
      let starred = false;
      let watched = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
        watched = await this.hasWatchedByUser(user);
      }
      return { starCount, starred, watched };
    };

    Source.apiToggleStar = async function (sourceId, user) {
      let source = await Source.findById(sourceId);
      if (!source) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }
      let isStarred = await source.hasStarredByUser(user);
      if (isStarred) {
        await source.removeStarredByUser(user);
      } else {
        await source.addStarredByUser(user);
        await source.addWatchedByUser(user);
      }
      return await source.toStarData(user);
    };

    Source.apiToggleWatch = async function (sourceId, user) {
      let source = await Source.findById(sourceId);
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }
      let isWatched = await source.hasWatchedByUser(user);
      if (isWatched) {
        await source.removeWatchedByUser(user);
      } else {
        await source.addWatchedByUser(user);
      }
      return { watched: !isWatched };
    };

    Source.prototype.updateIndex = function (data) {
      data = data || this.head.toCoreData();
      search.updateSource(data);
    };
  };

  return Source;
}
