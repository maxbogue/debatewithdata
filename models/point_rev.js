import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const PointRev = sequelize.define('point_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
  });

  PointRev.associate = function (models) {
    PointRev.belongsTo(models.User, { as: 'author' });
    PointRev.belongsTo(models.Point);
    PointRev.belongsTo(models.Blob, { as: 'text' });
    PointRev.belongsTo(models.PointRev, {
      as: 'PrevRev',
      foreignKey: 'prev_rev_id',
    });
  };

  return PointRev;
}
