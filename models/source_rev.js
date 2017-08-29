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
      allowNull: false,
      validate: { isUrl: true },
    },
    ary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  SourceRev.associate = function (models) {
    SourceRev.belongsTo(models.User, { as: 'author' });
    SourceRev.belongsTo(models.Source);
    SourceRev.belongsTo(models.Blob);
    SourceRev.belongsTo(models.SourceRev, {
      as: 'PrevRev',
      foreignKey: 'prev_rev_id',
    });
  };

  return SourceRev;
}
