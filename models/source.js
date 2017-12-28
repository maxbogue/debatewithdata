import isEqual from 'lodash/isEqual';

import { NotFoundError } from '../api/error';
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

      let source = await Source.create({}, { transaction });
      let blob = await models.Blob.fromText(data.text, transaction);
      let rev = await models.SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        blobHash: blob.hash,
        url: data.url,
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

    Source.prototype.toCoreData = function () {
      if (this.head.deleted) {
        return {
          deleted: true,
        };
      }

      let data = {
        url: this.head.url,
        text: this.head.blob.text,
        type: this.head.type,
      };

      switch (this.head.type) {
      case 'research':
        data.institution = this.head.institution;
        data.publication = this.head.publication;
        break;
      case 'article':
        data.publication = this.head.publication;
        data.firstHand = this.head.firstHand;
        break;
      case 'authority':
        data.institution = this.head.institution;
        break;
      }

      return data;
    };

    Source.prototype.toData = async function () {
      let data = this.toCoreData();
      data.rev = this.headId;

      if (this.head.deleted) {
        return data;
      }

      data.commentCount = await this.countComments();
      return data;
    };

    Source.apiGet = async function (sourceId) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }
      return await source.toData();
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
