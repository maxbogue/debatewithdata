import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const ClaimRev = sequelize.define('claim_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  ClaimRev.associate = function (models) {
    ClaimRev.belongsTo(models.User);
    ClaimRev.belongsTo(models.Claim);
    ClaimRev.belongsTo(models.Blob);
    ClaimRev.belongsTo(models.ClaimRev, {
      as: 'parent',
    });
    ClaimRev.Points = ClaimRev.belongsToMany(models.PointRev, {
      through: models.ClaimPoint,
      as: 'pointRevs',
    });
  };

  return ClaimRev;
}
