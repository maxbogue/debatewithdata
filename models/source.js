import { genId } from './utils';

const INCLUDE_ALL = { include: { all: true, nested: true } };

export default function (sequelize, DataTypes) {
  const Source = sequelize.define('source', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Source.associate = function (models) {
    Source.belongsTo(models.SourceRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Source.hasMany(models.SourceRev);
  };

  Source.postAssociate = function (models) {
    Source.apiCreate = async function (author, url, text, ary = null) {
      let source = await Source.create();
      let blob = await models.Blob.fromText(text);
      let rev = await models.SourceRev.create({
        url,
        ary,
        blob_hash: blob.hash,
        author_id: author.id,
        source_id: source.id,
      });
      await source.setHead(rev);
      return source.id;
    };

    Source.prototype.checkLoaded = function (msg) {
      if (!this.head || !this.head.deleted && !this.head.blob) {
        throw Error(msg);
      }
    };

    Source.prototype.apiUpdate =
      async function (author, url, text, ary = null) {
        this.checkLoaded('Must include all nested to update.');

        if (!this.head.deleted &&
            url === this.head.url &&
            text === this.head.blob.text &&
            ary === this.head.ary) {
          return false;
        }

        let blob = await models.Blob.fromText(text);
        let rev = await models.SourceRev.create({
          url,
          ary,
          blob_hash: blob.hash,
          author_id: author.id,
          source_id: this.id,
          prev_rev_id: this.head_id,
        });
        await this.setHead(rev);
        await this.reload(INCLUDE_ALL);
        return true;
      };

    Source.prototype.apiDelete = async function (user) {
      if (!this.head) {
        throw Error('Must include all to delete.');
      }

      if (this.head.deleted) {
        return false;
      }

      let rev = await models.SourceRev.create({
        deleted: true,
        author_id: user.id,
        source_id: this.id,
        prev_rev_id: this.head_id,
      });
      await this.setHead(rev);
      await this.reload(INCLUDE_ALL);
      return true;
    };

    Source.prototype.toApiFormat = function () {
      this.checkLoaded('Must include all nested for API format.');

      if (this.head.deleted) {
        return { deleted: true };
      }

      return {
        url: this.head.url,
        text: this.head.blob.text,
        ary: this.head.ary,
      };
    };

    Source.getForApi = async function (sourceId) {
      let source = await Source.findById(sourceId, INCLUDE_ALL);
      if (!source) {
        throw Error('Source ID not found: ' + sourceId);
      }
      return source.toApiFormat();
    };

    Source.getAllForApi = async function () {
      let sources = await Source.findAll(INCLUDE_ALL);
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
