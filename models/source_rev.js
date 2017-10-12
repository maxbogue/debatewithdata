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
    ary: {
      type: DataTypes.INTEGER,
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
    SourceRev.INCLUDE = function () {
      return {
        include: [models.Blob],
      };
    };
  };

  return SourceRev;
}
