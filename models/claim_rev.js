import { genRevId, isValidFlag } from './utils';

export default function (sequelize, DataTypes) {
  const ClaimRev = sequelize.define('claim_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    flag: {
      type: DataTypes.TEXT,
      validate: { isValidFlag },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  ClaimRev.associate = function (models) {
    ClaimRev.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.belongsTo(models.Claim, {
      foreignKey: {
        name: 'claimId',
        field: 'claim_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    ClaimRev.belongsTo(models.Blob, {
      foreignKey: {
        name: 'blobHash',
        field: 'blob_hash',
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.belongsTo(models.ClaimRev, {
      as: 'parent',
      foreignKey: {
        name: 'parentId',
        field: 'parent_id',
      },
      onDelete: 'RESTRICT',
    });
    ClaimRev.PointRevs = ClaimRev.belongsToMany(models.PointRev, {
      through: models.ClaimPoint,
      as: 'pointRevs',
    });
  };

  ClaimRev.postAssociate = function (models) {
    ClaimRev.INCLUDE = function (n, includeUser=false) {
      if (n < 1) {
        throw new Error('Must include at least 1 tier.');
      }
      let include = [models.Blob];
      if (includeUser) {
        include.push(models.User);
      }
      if (n > 1) {
        include.push({
          association: ClaimRev.PointRevs,
          ...models.PointRev.INCLUDE(n - 1, includeUser),
        });
      }
      return { include };
    };

    ClaimRev.prototype.toRevData = function (pointRevDatas) {
      let thisData = {
        id: this.id,
        username: this.user.username,
        createdAt: this.created_at,
      };

      if (this.deleted) {
        thisData.deleted = true;
        return thisData;
      }

      thisData.text = this.blob.text;

      if (this.flag) {
        thisData.flag = this.flag;
      }

      if (this.pointRevs) {
        thisData.points = models.PointRev.toRevDatas(
            this.pointRevs, pointRevDatas);
      }

      return thisData;
    };
  };

  return ClaimRev;
}
