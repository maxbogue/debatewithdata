export default function (sequelize, DataTypes) {
  const PointPoint = sequelize.define('pointPoint', {
    isFor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_for',
    },
  });

  return PointPoint;
}
