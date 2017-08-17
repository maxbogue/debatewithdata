import { genId } from './utils';

export default function (sequelize, DataTypes) {
  const Point = sequelize.define('point', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genId,
    },
  });

  Point.associate = function (models) {
    Point.belongsTo(models.PointRev, {
      as: 'head',
      // sequelize.sync() fails without this because it doesn't handle cycles.
      constraints: false,
    });
    Point.hasMany(models.PointRev);
  };

  return Point;
}
