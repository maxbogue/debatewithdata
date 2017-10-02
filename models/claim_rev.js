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
    ClaimRev.PointRevs = ClaimRev.belongsToMany(models.PointRev, {
      through: models.ClaimPoint,
      as: 'pointRevs',
    });
  };

  ClaimRev.postAssociate = function (models) {
    ClaimRev.INCLUDE = function (n) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      let include = [models.Blob];
      if (n > 1) {
        include.push({
          association: ClaimRev.PointRevs,
          ...models.PointRev.INCLUDE(n-1),
        });
      }
      return { include };
    };
  };

  return ClaimRev;
}
