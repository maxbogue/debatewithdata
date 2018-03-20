import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import pick from 'lodash/pick';

import { NotFoundError } from '../api/error';
import { ValidationError, validateSource } from '../common/validate';
import { genId } from './utils';

const SOURCE_EQUALITY_FIELDS = [
  'url',
  'text',
  'type',
  'institution',
  'publication',
  'firstHand',
  'deleted',
  'deleteMessage',
];

function sourcesAreEqual(s1, s2) {
  let filtered1 = pick(s1, SOURCE_EQUALITY_FIELDS);
  let filtered2 = pick(s2, SOURCE_EQUALITY_FIELDS);
  return isEqual(filtered1, filtered2);
}

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
          starrable: 'source',
        }
      },
      foreignKey: 'starrableId',
      constraints: false,
    });
    Source.hasMany(models.Comment, {
      foreignKey: 'commentableId',
      constraints: false,
      scope: {
        commentable: 'source',
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
      let blob = await models.Blob.fromText(data.text, transaction);
      let rev = await models.SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        blobHash: blob.hash,
        url: data.url,
        date: data.date,
        type: data.type,
        institution: data.institution,
        publication: data.publication,
        firstHand: data.firstHand,
      }, { transaction });
      await source.setHead(rev, { transaction });
      return rev;
    };

    Source.apiUpdate = async function (sourceId, user, data, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiUpdate(sourceId, user, data, t);
        });
      }

      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }

      validateSource(data);

      if (sourcesAreEqual(data, source.head.toCoreData())) {
        return source.head;
      }

      let blob = await models.Blob.fromText(data.text, transaction);
      let rev = await models.SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        parentId: source.headId,
        blobHash: blob.hash,
        url: data.url,
        date: data.date,
        type: data.type,
        institution: data.institution,
        publication: data.publication,
        firstHand: data.firstHand,
      }, { transaction });
      await source.setHead(rev, { transaction });
      return rev;
    };

    Source.apiDelete = async function (sourceId, user, msg, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiDelete(sourceId, user, msg, t);
        });
      }

      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
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
      data.star = await this.toStarData(user);
      data.commentCount = await this.countComments();
      return data;
    };

    Source.apiGet = async function (sourceId, user) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }

      // Referenced by points.
      let claims1 = await models.Claim.findAll({
        include: [{
          association: models.Claim.Head,
          required: true,
          include: [models.Blob, {
            model: models.PointRev,
            as: 'pointRevs',
            where: { sourceId },
          }],
        }],
      });

      // Referenced by sub-points.
      let claims2 = await models.Claim.findAll({
        include: [{
          association: models.Claim.Head,
          required: true,
          include: [models.Blob, {
            model: models.PointRev,
            required: true,
            as: 'pointRevs',
            include: [{
              model: models.PointRev,
              as: 'pointRevs',
              where: { sourceId },
            }],
          }],
        }],
      });

      let claims = claims1.concat(claims2);

      let sourceData = await source.toData(user);
      sourceData.claimIds = map(claims, (c) => c.id);

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
        throw new NotFoundError('Source not found: ' + sourceId);
      }

      let sourceRevData = map(sourceRevs, (rev) => rev.toRevData());
      return { sourceRevs: sourceRevData };
    };

    Source.prototype.toStarData = async function (user) {
      let count = await this.countStarredByUsers();
      let starred = false;
      if (user) {
        starred = await this.hasStarredByUser(user);
      }
      return { count, starred };
    };

    Source.apiToggleStar = async function (sourceId, user) {
      let source = await Source.findById(sourceId);
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }
      let isStarred = await source.hasStarredByUser(user);
      if (isStarred) {
        await source.removeStarredByUser(user);
      } else {
        await source.addStarredByUser(user);
      }
      return await source.toStarData(user);
    };
  };

  return Source;
}
