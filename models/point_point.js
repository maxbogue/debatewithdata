export default function (sequelize, DataTypes) {
  const PointPoint = sequelize.define('point_point', {
    'is_for': {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return PointPoint;
}
