export default function (sequelize, DataTypes) {
  const PointPoint = sequelize.define('point_point', {
    isFor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_for',
    },
  });

  return PointPoint;
}
