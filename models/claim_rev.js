import { genRevId } from './utils';
import { validateClaim } from '../common/validate';

export default function (sequelize, DataTypes) {
  const ClaimRev = sequelize.define('claim_rev', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    flag: {
      type: DataTypes.TEXT,
      validate: validateClaim.flag.forDb,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteMessage: {
      field: 'delete_message',
      type: DataTypes.TEXT,
      validate: validateClaim.deleteMessage.forDb,
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
    ClaimRev.Claims = ClaimRev.belongsToMany(models.Claim, {
      through: models.ClaimClaim,
      as: 'claims',
    });
    ClaimRev.Sources = ClaimRev.belongsToMany(models.Source, {
      through: models.ClaimSource,
      as: 'sources',
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

    ClaimRev.prototype.toCoreData = function (recurse=false) {
      let data = {
        id: this.claimId,
        revId: this.id,
      };

      if (this.deleted) {
        data.deleted = true;
        data.deleteMessage = this.deleteMessage;
        return data;
      }

      data.text = this.blob.text;

      if (this.flag) {
        data.flag = this.flag;
      }

      if (recurse) {
        data.points = models.PointRev.toCoreDatas(this.pointRevs, true);
      }

      return data;
    };

    ClaimRev.prototype.toRevData = function (pointRevDatas) {
      let thisData = this.toCoreData();
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
