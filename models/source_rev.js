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
    SourceRev.belongsTo(models.User, { as: 'author' });
    SourceRev.belongsTo(models.Source);
    SourceRev.belongsTo(models.Blob);
    SourceRev.belongsTo(models.SourceRev, {
      as: 'prev_rev',
      foreignKey: 'prev_rev_id',
    });
  };

  return SourceRev;
}
