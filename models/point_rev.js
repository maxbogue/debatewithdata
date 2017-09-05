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
    PointRev.belongsTo(models.Blob);
    PointRev.belongsTo(models.PointRev, {
      as: 'prevRev',
    });
    PointRev.belongsToMany(models.ClaimRev, {
      through: models.ClaimPoint,
      as: 'claimRevs',
    });
    PointRev.belongsToMany(models.PointRev, {
      through: models.PointPoint,
      as: 'subpointRevs',
    });
  };

  return PointRev;
}
