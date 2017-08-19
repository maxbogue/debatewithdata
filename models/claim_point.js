export default function (sequelize, DataTypes) {
  const ClaimPoint = sequelize.define('claim_point', {
    isFor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_for',
    },
  });

  return ClaimPoint;
}
