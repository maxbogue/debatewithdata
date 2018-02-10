import isEqual from 'lodash/isEqual';

import { NotFoundError } from '../api/error';
import { validateSource } from '../common/validate';
import { genId } from './utils';

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

      let oldData = await source.toData();
      delete oldData.rev;
      delete oldData.commentCount;
      if (isEqual(data, oldData)) {
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

    Source.apiDelete = async function (sourceId, user, transaction) {
      if (!transaction) {
        return await sequelize.transaction(function(t) {
          return Source.apiDelete(sourceId, user, t);
        });
      }

      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }

      if (source.head.deleted) {
        return source.head;
      }

      let rev = await models.SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        parentId: source.headId,
        deleted: true,
      }, { transaction });
      await source.setHead(rev, { transaction });
      return rev;
    };

    Source.prototype.toData = async function () {
      let data = this.head.toCoreData();
      data.rev = this.headId;
      data.commentCount = await this.countComments();
      return data;
    };

    Source.apiGet = async function (sourceId) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }
      let sourceData = await source.toData();
      return {
        sources: {
          [sourceId]: sourceData,
        },
      };
    };

    Source.apiGetAll = async function () {
      let sources = await Source.findAll(Source.INCLUDE());
      let ret = {};
      for (let source of sources) {
        if (!source.head.deleted) {
          ret[source.id] = await source.toData();
        }
      }
      return ret;
    };
  };

  return Source;
}
