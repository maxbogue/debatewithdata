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
  };

  Source.postAssociate = function (models) {
    Source.INCLUDE_HEAD = {
      include: [{
        association: Source.Head,
        include: [models.Blob],
      }],
    };

    Source.INCLUDE_TEXT = {
      include: [models.Blob],
    };

    Source.apiCreate = async function (user, { url, text, ary }) {
      let source = await Source.create();
      let blob = await models.Blob.fromText(text);
      let rev = await models.SourceRev.create({
        user_id: user.id,
        source_id: source.id,
        blob_hash: blob.hash,
        url,
        ary,
      });
      await source.setHead(rev);
      return rev;
    };

    Source.apiUpdate = async function (sourceId, user, data) {
      let source = await Source.findById(sourceId, Source.INCLUDE_HEAD);
      if (!source) {
        throw new Error('No source found for ID: ' + sourceId);
      }

      if (!source.head.deleted &&
          data.text === source.head.blob.text &&
          data.url === source.head.url &&
          data.ary === source.head.ary) {
        return source.head;
      }

      let blob = await models.Blob.fromText(data.text);
      let rev = await models.SourceRev.create({
        user_id: user.id,
        source_id: source.id,
        parent_id: source.head_id,
        blob_hash: blob.hash,
        url: data.url,
        ary: data.ary,
      });
      await source.setHead(rev);
      return rev;
    };

    Source.apiDelete = async function (sourceId, user) {
      let source = await Source.findById(sourceId, Source.INCLUDE_HEAD);
      if (!source) {
        throw new Error('No source found for ID: ' + sourceId);
      }

      if (source.head.deleted) {
        return source.head;
      }

      let rev = await models.SourceRev.create({
        user_id: user.id,
        source_id: source.id,
        parent_id: source.head_id,
        deleted: true,
      });
      await source.setHead(rev);
      return rev;
    };

    Source.prototype.toApiFormat = function () {
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

    Source.getForApi = async function (sourceId) {
      let source = await Source.findById(sourceId, Source.INCLUDE_HEAD);
      if (!source) {
        throw Error('Source ID not found: ' + sourceId);
      }
      return source.toApiFormat();
    };

    Source.getAllForApi = async function () {
      let sources = await Source.findAll(Source.INCLUDE_HEAD);
      let ret = {};
      for (let source of sources) {
        if (!source.head.deleted) {
          ret[source.id] = source.toApiFormat();
        }
      }
      return ret;
    };
  };

  return Source;
}
