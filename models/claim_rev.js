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

    ClaimRev.prototype.toCoreData = function () {
      if (this.deleted) {
        return {
          deleted: true,
        };
      }

      let data = {
        text: this.blob.text,
      };

      if (this.flag) {
        data.flag = this.flag;
      }

      return data;
    };

    ClaimRev.prototype.toRevData = function (pointRevDatas) {
      let thisData = this.toCoreData();
      thisData.id = this.id;
      thisData.username = this.user.username;
      thisData.createdAt = this.created_at;

      if (!thisData.deleted && this.pointRevs) {
        thisData.points = models.PointRev.toRevDatas(
            this.pointRevs, pointRevDatas);
      }

      return thisData;
    };
  };

  return ClaimRev;
}
