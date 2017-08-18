export default function (sequelize, DataTypes) {
  const ClaimPoint = sequelize.define('claim_point', {
    'is_for': {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return ClaimPoint;
}
