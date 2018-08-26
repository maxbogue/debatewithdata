export default function(sequelize, DataTypes) {
  const ClaimClaim = sequelize.define('claimClaim', {
    isFor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_for',
    },
  });

  return ClaimClaim;
}
