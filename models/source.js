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
    Source.belongsTo(models.SourceRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Source.hasMany(models.SourceRev);

    Source.makeNew = async function (author, url, text, ary = null) {
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

    Source.prototype.tryUpdate =
      async function (author, url, text, ary = null) {
        if (url === this.head.url &&
            text === this.head.blob.text &&
            ary === this.head.ary) {
          return;
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
      };
  };

  return Source;
}

