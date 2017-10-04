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
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Source.hasMany(models.SourceRev);
    Source.hasMany(models.Comment, {
      foreignKey: 'commentable_id',
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
        user_id: user.id,
        source_id: source.id,
        blob_hash: blob.hash,
        url: data.url,
        ary: data.ary,
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

      if (!source.head.deleted &&
          data.text === source.head.blob.text &&
          data.url === source.head.url &&
          data.ary === source.head.ary) {
        return source.head;
      }

      let blob = await models.Blob.fromText(data.text, transaction);
      let rev = await models.SourceRev.create({
        user_id: user.id,
        source_id: source.id,
        parent_id: source.head_id,
        blob_hash: blob.hash,
        url: data.url,
        ary: data.ary,
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
        user_id: user.id,
        source_id: source.id,
        parent_id: source.head_id,
        deleted: true,
      }, { transaction });
      await source.setHead(rev, { transaction });
      return rev;
    };

    Source.prototype.toData = function () {
      if (this.head.deleted) {
        return {
          rev: this.head_id,
          deleted: true,
        };
      }

      return {
        rev: this.head_id,
        url: this.head.url,
        text: this.head.blob.text,
        ary: this.head.ary,
      };
    };

    Source.apiGet = async function (sourceId) {
      let source = await Source.findById(sourceId, Source.INCLUDE());
      if (!source) {
        throw new NotFoundError('Source not found: ' + sourceId);
      }
      return source.toData();
    };

    Source.apiGetAll = async function () {
      let sources = await Source.findAll(Source.INCLUDE());
      let ret = {};
      for (let source of sources) {
        if (!source.head.deleted) {
          ret[source.id] = source.toData();
        }
      }
      return ret;
    };
  };

  return Source;
}
