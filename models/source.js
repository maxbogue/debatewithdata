import search from '../common/search';
import { ConflictError, NotFoundError } from '../api/error';
import { ItemType } from '../common/constants';
import { ValidationError, validateSource } from '../common/validate';
import { genId } from './utils';
import { sourcesAreEqual } from '../common/equality';

export default function (sequelize, DataTypes) {
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
          starrable: ItemType.SOURCE,
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Source.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: ItemType.SOURCE,
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
      data.commentCount = await this.countComments();
      return data;
    };

    Source.apiGet = async function (sourceId, user) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Data not found: ' + sourceId);
      }

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

      let sourceData = await source.toData(user);
      sourceData.claimIds = claims.map((claim) => claim.id);

      let data = {
        sources: {
          [sourceId]: sourceData,
        },
        claims: {},
      };

      for (let claim of claims) {
        await claim.fillData(data, 1);
      }

      return data;
    };

    Source.apiGetAll = async function (user) {
      let sources = await Source.findAll(Source.INCLUDE());
      let ret = {};
      for (let source of sources) {
        if (!source.head.deleted) {
          ret[source.id] = await source.toData(user);
        }
      }
      return ret;
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
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { starCount, starred };
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
      }
      return await source.toStarData(user);
    };

    Source.prototype.updateIndex = function (data) {
      data = data || this.head.toCoreData();
      search.updateSource(data);
    };
  };

  return Source;
}
