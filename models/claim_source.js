export default function (sequelize, DataTypes) {
  const ClaimSource = sequelize.define('claimSource', {
    isFor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_for',
    },
  });

  return ClaimSource;
}
