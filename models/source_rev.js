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
      defaultValue: false,
      allowNull: false,
    },
  });

  SourceRev.associate = function (models) {
    SourceRev.belongsTo(models.User);
    SourceRev.belongsTo(models.Source);
    SourceRev.belongsTo(models.Blob);
    SourceRev.belongsTo(models.SourceRev, {
      as: 'parent',
      foreignKey: 'parent_id',
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
