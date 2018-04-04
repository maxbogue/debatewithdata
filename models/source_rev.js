import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';

import { genRevId } from './utils';
import { validateSource } from '../common/validate';

const SOURCE_EQUALITY_FIELDS = [
  'url',
  'text',
  'date',
  'table',
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
      validateSource(data);

      if (source.head && sourcesAreEqual(data, source.head.toCoreData())) {
        return source.head;
      }

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
        institution: data.institution,
        publication: data.publication,
        firstHand: data.firstHand,
      }, { transaction });

      await source.setHead(rev, { transaction });
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

      if (this.date) {
        data.date = this.date;
      }

      if (this.tableBlob) {
        data.table = this.tableBlob.text;
      }

      switch (this.type) {
      case 'research':
        data.institution = this.institution;
        data.publication = this.publication;
        break;
      case 'article':
        data.publication = this.publication;
        data.firstHand = this.firstHand;
        break;
      case 'authority':
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
