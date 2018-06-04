import { genRevId } from './utils';
import { validateSource } from '../common/validate';
import { SourceType } from '../common/constants';

export default function (sequelize, DataTypes) {
  const SourceRev = sequelize.define('source_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    url: {
      type: DataTypes.TEXT,
      validate: validateSource.url.forDb,
    },
    date: {
      type: DataTypes.TEXT,
      validate: validateSource.date.forDb,
    },
    type: {
      type: DataTypes.TEXT,
      validate: validateSource.type.forDb,
    },
    chart: {
      type: DataTypes.TEXT,
    },
    institution: {
      type: DataTypes.TEXT,
      validate: validateSource.institution.forDb,
    },
    publication: {
      type: DataTypes.TEXT,
      validate: validateSource.publication.forDb,
    },
    firstHand: {
      field: 'first_hand',
      type: DataTypes.BOOLEAN,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteMessage: {
      field: 'delete_message',
      type: DataTypes.TEXT,
      validate: validateSource.deleteMessage.forDb,
    },
  });

  SourceRev.associate = function (models) {
    SourceRev.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
    });
    SourceRev.belongsTo(models.Source, {
      foreignKey: {
        name: 'sourceId',
        field: 'source_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    SourceRev.belongsTo(models.Blob, {
      foreignKey: {
        name: 'blobHash',
        field: 'blob_hash',
      },
      onDelete: 'RESTRICT',
    });
    SourceRev.belongsTo(models.SourceRev, {
      as: 'parent',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id',
      },
      onDelete: 'RESTRICT',
    });
    SourceRev.Table = SourceRev.belongsTo(models.Blob, {
      as: 'tableBlob',
      foreignKey: {
        name: 'tableHash',
        field: 'table_hash',
      },
      onDelete: 'RESTRICT',
    });
  };

  SourceRev.postAssociate = function (models) {
    SourceRev.INCLUDE = function (includeUser=false) {
      let include = [models.Blob, {
        association: SourceRev.Table,
      }];
      if (includeUser) {
        include.push(models.User);
      }
      return { include };
    };

    SourceRev.createForApi = async function (source, user, data, transaction) {
      let blob = await models.Blob.fromText(data.text, transaction);
      let tableBlob = {};
      if (data.table) {
        tableBlob = await models.Blob.fromText(data.table, transaction);
      }
      let rev = await SourceRev.create({
        userId: user.id,
        sourceId: source.id,
        parentId: source.headId,
        blobHash: blob.hash,
        url: data.url,
        date: data.date,
        tableHash: tableBlob.hash,
        type: data.type,
        chart: data.chart ? JSON.stringify(data.chart) : null,
        institution: data.institution,
        publication: data.publication,
        firstHand: data.firstHand,
      }, { transaction });

      await source.setHead(rev, { transaction });
      source.updateIndex({ id: source.id, text: data.text });
      return rev;
    };

    SourceRev.prototype.toCoreData = function () {
      let data = {
        id: this.sourceId,
        revId: this.id,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.url = this.url;
      data.text = this.blob.text;
      data.type = this.type;
      data.date = this.date || null;
      data.table = this.tableBlob ? this.tableBlob.text : null;
      data.chart = this.chart ? JSON.parse(this.chart) : null;
      data.institution = null;
      data.publication = null;

      switch (this.type) {
      case SourceType.RESEARCH:
        data.institution = this.institution;
        data.publication = this.publication;
        break;
      case SourceType.ARTICLE:
        data.publication = this.publication;
        break;
      case SourceType.AUTHORITY:
        data.institution = this.institution;
        break;
      }

      return data;
    };

    SourceRev.prototype.toRevData = function () {
      let data = this.toCoreData();
      data.username = this.user.username;
      data.createdAt = this.created_at;
      return data;
    };
  };

  return SourceRev;
}
