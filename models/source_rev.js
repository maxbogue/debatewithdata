import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const SourceRev = sequelize.define('source_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    url: {
      type: DataTypes.TEXT,
      validate: { isUrl: true },
    },
    type: {
      type: DataTypes.TEXT,
    },
    institution: {
      type: DataTypes.TEXT,
    },
    publication: {
      type: DataTypes.TEXT,
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
  };

  SourceRev.postAssociate = function (models) {
    SourceRev.INCLUDE = function (includeUser=false) {
      let include = [models.Blob];
      if (includeUser) {
        include.push(models.User);
      }
      return { include };
    };

    SourceRev.prototype.toCoreData = function () {
      if (this.deleted) {
        return {
          deleted: true,
        };
      }

      let data = {
        url: this.url,
        text: this.blob.text,
        type: this.type,
      };

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
      data.id = this.id;
      data.username = this.user.username;
      data.createdAt = this.created_at;
      return data;
    };
  };

  return SourceRev;
}
