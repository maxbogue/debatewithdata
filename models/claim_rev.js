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
    ClaimRev.belongsTo(models.User, { as: 'author' });
    ClaimRev.belongsTo(models.Claim);
    ClaimRev.belongsTo(models.Blob, { as: 'text' });
    ClaimRev.belongsTo(models.ClaimRev, {
      as: 'PrevRev',
      foreignKey: 'prev_rev_id',
    });
    ClaimRev.belongsToMany(models.PointRev, { through: models.ClaimPoint });
  };

  return ClaimRev;
}
